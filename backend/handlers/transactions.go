package handlers

import (
	"bytes"
	"encoding/json"
	"fmt"
	"net/http"
	"os"
	"strconv"
	"time"

	"github.com/gin-gonic/gin"
	"snapadeal/config"
	"snapadeal/models"
)

type CreateTransactionRequest struct {
	DealID        uint   `json:"deal_id" binding:"required"`
	Quantity      int    `json:"quantity" binding:"required"`
	PaymentMethod string `json:"payment_method" binding:"required"`
	PhoneNumber   string `json:"phone_number" binding:"required"`
}

type FlutterwavePaymentRequest struct {
	TxRef          string                 `json:"tx_ref"`
	Amount         string                 `json:"amount"`
	Currency       string                 `json:"currency"`
	RedirectURL    string                 `json:"redirect_url"`
	PaymentOptions string                 `json:"payment_options"`
	Customer       FlutterwaveCustomer    `json:"customer"`
	Customizations FlutterwaveCustomization `json:"customizations"`
	Meta           []FlutterwaveMeta      `json:"meta"`
}

type FlutterwaveCustomer struct {
	Email       string `json:"email"`
	PhoneNumber string `json:"phonenumber"`
	Name        string `json:"name"`
}

type FlutterwaveCustomization struct {
	Title       string `json:"title"`
	Description string `json:"description"`
	Logo        string `json:"logo"`
}

type FlutterwaveMeta struct {
	MetaName  string `json:"metaname"`
	MetaValue string `json:"metavalue"`
}

type FlutterwaveResponse struct {
	Status  string `json:"status"`
	Message string `json:"message"`
	Data    struct {
		Link string `json:"link"`
	} `json:"data"`
}

func CreateTransaction(c *gin.Context) {
	userID := c.GetUint("user_id")
	fmt.Printf("🔄 CreateTransaction called by user %d\n", userID)

	var req CreateTransactionRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		fmt.Printf("❌ JSON binding error: %v\n", err)
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	fmt.Printf("📝 Transaction request: %+v\n", req)

	// Get user details
	var user models.User
	if err := config.DB.First(&user, userID).Error; err != nil {
		fmt.Printf("❌ User not found: %v\n", err)
		c.JSON(http.StatusNotFound, gin.H{"error": "User not found"})
		return
	}

	// Validate deal exists and is available
	var deal models.Deal
	if err := config.DB.Preload("Merchant").First(&deal, req.DealID).Error; err != nil {
		fmt.Printf("❌ Deal not found: %v\n", err)
		c.JSON(http.StatusNotFound, gin.H{"error": "Deal not found"})
		return
	}

	// Check if deal is approved and active
	if deal.Status != "approved" {
		fmt.Printf("❌ Deal not approved: %s\n", deal.Status)
		c.JSON(http.StatusBadRequest, gin.H{"error": "Deal is not available for purchase"})
		return
	}

	// Check if deal is still available
	if deal.SoldQuantity+req.Quantity > deal.MaxQuantity {
		fmt.Printf("❌ Not enough quantity available\n")
		c.JSON(http.StatusBadRequest, gin.H{"error": "Not enough quantity available"})
		return
	}

	// Check if deal is not expired
	if deal.IsExpired() {
		fmt.Printf("❌ Deal has expired\n")
		c.JSON(http.StatusBadRequest, gin.H{"error": "Deal has expired"})
		return
	}

	// Calculate total amount
	totalAmount := deal.DiscountPrice * float64(req.Quantity)

	// Create transaction
	transaction := models.Transaction{
		UserID:        userID,
		DealID:        req.DealID,
		Quantity:      req.Quantity,
		Amount:        totalAmount,
		PaymentMethod: req.PaymentMethod,
		PhoneNumber:   req.PhoneNumber,
		Status:        "pending",
	}

	if err := config.DB.Create(&transaction).Error; err != nil {
		fmt.Printf("❌ Failed to create transaction: %v\n", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create transaction"})
		return
	}

	fmt.Printf("✅ Transaction created with ID: %d\n", transaction.ID)

	// Check Flutterwave configuration
	flwPubKey := os.Getenv("FLUTTERWAVE_PUBLIC_KEY")
	flwSecKey := os.Getenv("FLUTTERWAVE_SECRET_KEY")

	var paymentURL string
	var err error

	if flwPubKey != "" && flwSecKey != "" && 
		 flwPubKey != "FLWPUBK_TEST-your-public-key-here" && 
		 flwSecKey != "FLWSECK_TEST-your-secret-key-here" {
		fmt.Printf("🔄 Creating Flutterwave payment for transaction %d\n", transaction.ID)
		paymentURL, err = createFlutterwavePayment(transaction, user, deal)
		if err != nil {
			fmt.Printf("❌ Flutterwave payment creation failed: %v\n", err)
			fmt.Printf("🔄 Falling back to simulation mode\n")
			paymentURL = fmt.Sprintf("http://localhost:3000/payment/verify?transaction_id=%d&simulate=true", transaction.ID)
		} else {
			fmt.Printf("✅ Flutterwave payment URL created: %s\n", paymentURL)
		}
	} else {
		fmt.Printf("⚠️  Flutterwave keys not configured - using simulation\n")
		paymentURL = fmt.Sprintf("http://localhost:3000/payment/verify?transaction_id=%d&simulate=true", transaction.ID)
	}

	// Load transaction with relations for response
	config.DB.Preload("Deal").Preload("Deal.Category").Preload("User").First(&transaction, transaction.ID)

	fmt.Printf("🔗 Final payment URL: %s\n", paymentURL)

	c.JSON(http.StatusCreated, gin.H{
		"message":     "Transaction created successfully",
		"transaction": transaction,
		"payment_url": paymentURL,
		"note":        "Complete payment to confirm your purchase",
	})
}

func createFlutterwavePayment(transaction models.Transaction, user models.User, deal models.Deal) (string, error) {
	// Get Flutterwave keys from environment
	secretKey := os.Getenv("FLUTTERWAVE_SECRET_KEY")

	// Create unique transaction reference
	txRef := fmt.Sprintf("SNAPADEAL_%d_%d", transaction.ID, time.Now().Unix())

	// IMPORTANT: Use a more specific redirect URL that includes the transaction ID
	redirectURL := fmt.Sprintf("http://localhost:3000/payment/verify?transaction_id=%d&tx_ref=%s", transaction.ID, txRef)

	// Prepare payment request
	paymentReq := FlutterwavePaymentRequest{
		TxRef:          txRef,
		Amount:         fmt.Sprintf("%.2f", transaction.Amount),
		Currency:       "UGX",
		RedirectURL:    redirectURL,
		PaymentOptions: "mobilemoney",
		Customer: FlutterwaveCustomer{
			Email:       user.Email,
			PhoneNumber: transaction.PhoneNumber,
			Name:        fmt.Sprintf("%s %s", user.FirstName, user.LastName),
		},
		Customizations: FlutterwaveCustomization{
			Title:       "Snapadeal Purchase",
			Description: fmt.Sprintf("Purchase of %s", deal.Title),
			Logo:        "https://snapadeal.com/logo.png",
		},
		Meta: []FlutterwaveMeta{
			{MetaName: "deal_id", MetaValue: fmt.Sprintf("%d", deal.ID)},
			{MetaName: "transaction_id", MetaValue: fmt.Sprintf("%d", transaction.ID)},
			{MetaName: "user_id", MetaValue: fmt.Sprintf("%d", user.ID)},
		},
	}

	fmt.Printf("🔄 Flutterwave payment request: %+v\n", paymentReq)

	// Convert to JSON
	jsonData, err := json.Marshal(paymentReq)
	if err != nil {
		return "", err
	}

	// Make request to Flutterwave
	req, err := http.NewRequest("POST", "https://api.flutterwave.com/v3/payments", bytes.NewBuffer(jsonData))
	if err != nil {
		return "", err
	}

	req.Header.Set("Authorization", "Bearer "+secretKey)
	req.Header.Set("Content-Type", "application/json")

	client := &http.Client{Timeout: 30 * time.Second}
	resp, err := client.Do(req)
	if err != nil {
		return "", err
	}
	defer resp.Body.Close()

	var flwResp FlutterwaveResponse
	if err := json.NewDecoder(resp.Body).Decode(&flwResp); err != nil {
		return "", err
	}

	fmt.Printf("🔄 Flutterwave response: %+v\n", flwResp)

	if flwResp.Status != "success" {
		return "", fmt.Errorf("Flutterwave error: %s", flwResp.Message)
	}

	// Update transaction with Flutterwave reference
	transaction.PaymentReference = txRef
	config.DB.Save(&transaction)

	fmt.Printf("✅ Flutterwave payment link: %s\n", flwResp.Data.Link)
	return flwResp.Data.Link, nil
}

func GetUserTransactions(c *gin.Context) {
	userID := c.GetUint("user_id")
	fmt.Printf("🔄 GetUserTransactions called for user %d\n", userID)

	var transactions []models.Transaction
	query := config.DB.Preload("Deal").Preload("Deal.Category").Where("user_id = ?", userID)

	// Pagination
	page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
	limit, _ := strconv.Atoi(c.DefaultQuery("limit", "20"))
	offset := (page - 1) * limit

	query = query.Offset(offset).Limit(limit).Order("created_at DESC")

	if err := query.Find(&transactions).Error; err != nil {
		fmt.Printf("❌ Error fetching transactions: %v\n", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch transactions"})
		return
	}

	fmt.Printf("✅ Found %d transactions for user %d\n", len(transactions), userID)
	c.JSON(http.StatusOK, gin.H{"transactions": transactions})
}

func VerifyPayment(c *gin.Context) {
	transactionID := c.Query("transaction_id")
	txRef := c.Query("tx_ref")
	status := c.Query("status")

	fmt.Printf("🔄 VerifyPayment called for transaction %s, tx_ref: %s, status: %s\n", transactionID, txRef, status)

	if transactionID == "" {
		fmt.Printf("❌ No transaction ID provided\n")
		c.Redirect(http.StatusFound, "http://localhost:3000/payment/success?error=missing_transaction_id")
		return
	}

	var transaction models.Transaction
	if err := config.DB.Preload("Deal").First(&transaction, transactionID).Error; err != nil {
		fmt.Printf("❌ Transaction not found: %v\n", err)
		c.Redirect(http.StatusFound, fmt.Sprintf("http://localhost:3000/payment/success?transaction_id=%s&status=failed&error=transaction_not_found", transactionID))
		return
	}

	// If this is a simulation (for development)
	if c.Query("simulate") == "true" {
		fmt.Printf("🔄 Processing simulation payment for transaction %s\n", transactionID)
		simulatePaymentCompletion(c, transaction)
		return
	}

	// Verify with Flutterwave if we have a tx_ref
	if txRef != "" {
		fmt.Printf("🔄 Verifying payment with Flutterwave for tx_ref: %s\n", txRef)
		verified, err := verifyFlutterwavePayment(txRef)
		if err != nil {
			fmt.Printf("❌ Payment verification failed: %v\n", err)
			status = "failed"
		} else if verified {
			status = "successful"
			fmt.Printf("✅ Flutterwave payment verified successfully\n")
		} else {
			status = "failed"
			fmt.Printf("❌ Flutterwave payment verification failed\n")
		}
	}

	// Update transaction status
	if status == "successful" || status == "completed" {
		transaction.Status = "completed"
		if txRef != "" {
			transaction.PaymentReference = txRef
		}

		// Update deal sold quantity
		var deal models.Deal
		if err := config.DB.First(&deal, transaction.DealID).Error; err == nil {
			deal.SoldQuantity += transaction.Quantity
			config.DB.Save(&deal)

			// Create notification for merchant
			notification := models.Notification{
				UserID:  deal.MerchantID,
				Title:   "New Sale! 💰",
				Message: fmt.Sprintf("Your deal '%s' was purchased by a customer!", deal.Title),
				Type:    models.NotificationDealPurchased,
				Data:    fmt.Sprintf(`{"deal_id": %d, "transaction_id": %d, "quantity": %d}`, deal.ID, transaction.ID, transaction.Quantity),
			}
			config.DB.Create(&notification)
		}
	} else {
		transaction.Status = "failed"
	}

	if err := config.DB.Save(&transaction).Error; err != nil {
		fmt.Printf("❌ Failed to update transaction: %v\n", err)
	}

	fmt.Printf("✅ Transaction %d status updated to: %s\n", transaction.ID, transaction.Status)

	// Redirect to success page with proper parameters
	redirectURL := fmt.Sprintf("http://localhost:3000/payment/success?transaction_id=%d&status=%s", transaction.ID, transaction.Status)
	if txRef != "" {
		redirectURL += fmt.Sprintf("&tx_ref=%s", txRef)
	}
	
	fmt.Printf("🔗 Redirecting to: %s\n", redirectURL)
	c.Redirect(http.StatusFound, redirectURL)
}

func verifyFlutterwavePayment(txRef string) (bool, error) {
	secretKey := os.Getenv("FLUTTERWAVE_SECRET_KEY")
	if secretKey == "" {
		return false, fmt.Errorf("Flutterwave secret key not configured")
	}

	url := fmt.Sprintf("https://api.flutterwave.com/v3/transactions/verify_by_reference?tx_ref=%s", txRef)
	
	req, err := http.NewRequest("GET", url, nil)
	if err != nil {
		return false, err
	}

	req.Header.Set("Authorization", "Bearer "+secretKey)
	req.Header.Set("Content-Type", "application/json")

	client := &http.Client{Timeout: 30 * time.Second}
	resp, err := client.Do(req)
	if err != nil {
		return false, err
	}
	defer resp.Body.Close()

	var result struct {
		Status string `json:"status"`
		Data   struct {
			Status string `json:"status"`
		} `json:"data"`
	}

	if err := json.NewDecoder(resp.Body).Decode(&result); err != nil {
		return false, err
	}

	return result.Status == "success" && result.Data.Status == "successful", nil
}

func simulatePaymentCompletion(c *gin.Context, transaction models.Transaction) {
	// Simulate successful payment for development
	transaction.Status = "completed"
	transaction.PaymentReference = fmt.Sprintf("SIM_%d_%d", transaction.ID, time.Now().Unix())

	// Update deal sold quantity
	var deal models.Deal
	if err := config.DB.First(&deal, transaction.DealID).Error; err == nil {
		deal.SoldQuantity += transaction.Quantity
		config.DB.Save(&deal)

		// Create notification for merchant
		notification := models.Notification{
			UserID:  deal.MerchantID,
			Title:   "New Sale! 💰",
			Message: fmt.Sprintf("Your deal '%s' was purchased by a customer!", deal.Title),
			Type:    models.NotificationDealPurchased,
			Data:    fmt.Sprintf(`{"deal_id": %d, "transaction_id": %d, "quantity": %d}`, deal.ID, transaction.ID, transaction.Quantity),
		}
		config.DB.Create(&notification)
	}

	config.DB.Save(&transaction)

	fmt.Printf("✅ Payment simulation completed for transaction %d\n", transaction.ID)
	
	redirectURL := fmt.Sprintf("http://localhost:3000/payment/success?transaction_id=%d&status=completed", transaction.ID)
	c.Redirect(http.StatusFound, redirectURL)
}

// Keep the old simulation endpoint for backward compatibility
func SimulatePayment(c *gin.Context) {
	transactionID := c.Param("id")
	fmt.Printf("🔄 SimulatePayment called for transaction %s\n", transactionID)

	var transaction models.Transaction
	if err := config.DB.Preload("Deal").First(&transaction, transactionID).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Transaction not found"})
		return
	}

	simulatePaymentCompletion(c, transaction)
}
