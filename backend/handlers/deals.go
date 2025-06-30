package handlers

import (
	"fmt"
	"net/http"
	"strconv"
	"time"

	"github.com/gin-gonic/gin"
	"snapadeal/config"
	"snapadeal/models"
)

type CreateDealRequest struct {
	Title            string    `json:"title" binding:"required"`
	Description      string    `json:"description" binding:"required"`
	ShortDescription string    `json:"short_description"`
	OriginalPrice    float64   `json:"original_price" binding:"required"`
	DiscountPrice    float64   `json:"discount_price" binding:"required"`
	ImageURL         string    `json:"image_url"`
	Images           []string  `json:"images"`
	CategoryID       uint      `json:"category_id" binding:"required"`
	StartDate        time.Time `json:"start_date" binding:"required"`
	EndDate          time.Time `json:"end_date" binding:"required"`
	MaxQuantity      int       `json:"max_quantity"`
	Location         string    `json:"location"`
	FinePrints       string    `json:"fine_prints"`
}

func CreateDeal(c *gin.Context) {
	fmt.Println("🔄 CreateDeal handler called")
	
	userID := c.GetUint("user_id")
	fmt.Printf("👤 User ID from middleware: %d\n", userID)
	
	if userID == 0 {
		fmt.Println("❌ No user ID found in context")
		c.JSON(http.StatusUnauthorized, gin.H{"error": "User not authenticated"})
		return
	}

	var req CreateDealRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		fmt.Printf("❌ JSON binding error: %v\n", err)
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	fmt.Printf("📝 Deal request data: %+v\n", req)

	// Validate dates
	if req.EndDate.Before(req.StartDate) {
		fmt.Println("❌ End date validation failed")
		c.JSON(http.StatusBadRequest, gin.H{"error": "End date must be after start date"})
		return
	}

	// Validate prices
	if req.DiscountPrice >= req.OriginalPrice {
		fmt.Println("❌ Price validation failed")
		c.JSON(http.StatusBadRequest, gin.H{"error": "Discount price must be less than original price"})
		return
	}

	// Validate maximum 10 images
	if len(req.Images) > 10 {
		fmt.Println("❌ Too many images")
		c.JSON(http.StatusBadRequest, gin.H{"error": "Maximum 10 images allowed per deal"})
		return
	}

	// Set default max quantity
	if req.MaxQuantity == 0 {
		req.MaxQuantity = 100
	}

	// Check if category exists
	var category models.Category
	if err := config.DB.First(&category, req.CategoryID).Error; err != nil {
		fmt.Printf("❌ Category not found: %v\n", err)
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid category selected"})
		return
	}

	fmt.Printf("✅ Category found: %s\n", category.Name)

	// Check if user exists and is a merchant
	var user models.User
	if err := config.DB.First(&user, userID).Error; err != nil {
		fmt.Printf("❌ User not found: %v\n", err)
		c.JSON(http.StatusUnauthorized, gin.H{"error": "User not found"})
		return
	}

	if user.Role != "merchant" {
		fmt.Printf("❌ User is not a merchant: %s\n", user.Role)
		c.JSON(http.StatusForbidden, gin.H{"error": "Only merchants can create deals"})
		return
	}

	fmt.Printf("✅ User verified: %s %s (Role: %s)\n", user.FirstName, user.LastName, user.Role)

	// Convert []string to StringArray for database storage
	imageArray := models.StringArray(req.Images)

	deal := models.Deal{
		Title:            req.Title,
		Description:      req.Description,
		ShortDescription: req.ShortDescription,
		OriginalPrice:    req.OriginalPrice,
		DiscountPrice:    req.DiscountPrice,
		ImageURL:         req.ImageURL,
		Images:           imageArray,
		CategoryID:       req.CategoryID,
		MerchantID:       userID,
		StartDate:        req.StartDate,
		EndDate:          req.EndDate,
		MaxQuantity:      req.MaxQuantity,
		Location:         req.Location,
		FinePrints:       req.FinePrints,
		Status:           "pending",
		IsActive:         true,
	}

	fmt.Printf("💾 Creating deal with images: %v\n", req.Images)

	if err := config.DB.Create(&deal).Error; err != nil {
		fmt.Printf("❌ Database error creating deal: %v\n", err)
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": "Failed to create deal",
			"details": err.Error(),
		})
		return
	}

	fmt.Printf("✅ Deal created with ID: %d\n", deal.ID)

	// Load relations for response
	if err := config.DB.Preload("Category").Preload("Merchant").First(&deal, deal.ID).Error; err != nil {
		fmt.Printf("⚠️ Warning: Failed to load relations: %v\n", err)
	}

	fmt.Println("✅ Deal creation successful - Status: PENDING (awaiting admin approval)")

	c.JSON(http.StatusCreated, gin.H{
		"message": "Deal created successfully and is pending admin approval",
		"deal":    deal,
		"status":  "pending",
		"note":    "Your deal will be visible to customers once approved by an administrator",
	})
}

// PUBLIC ENDPOINT - Only shows approved deals for customers
func GetDeals(c *gin.Context) {
	// Add explicit CORS headers for this endpoint
	c.Header("Access-Control-Allow-Origin", "*")
	c.Header("Access-Control-Allow-Methods", "GET, OPTIONS")
	c.Header("Access-Control-Allow-Headers", "Origin, Content-Type, Accept, Authorization, X-Requested-With")
	
	fmt.Println("🔄 GetDeals called - fetching APPROVED deals only (PUBLIC)")
	
	var deals []models.Deal
	// Only show approved and active deals to public
	query := config.DB.Preload("Category").Preload("Merchant").Where("status = ? AND is_active = ?", "approved", true)

	// Filter by category
	if categoryID := c.Query("category_id"); categoryID != "" {
		query = query.Where("category_id = ?", categoryID)
		fmt.Printf("🔍 Filtering by category: %s\n", categoryID)
	}

	// Filter by location
	if location := c.Query("location"); location != "" {
		query = query.Where("location ILIKE ?", "%"+location+"%")
		fmt.Printf("🔍 Filtering by location: %s\n", location)
	}

	// Pagination
	page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
	limit, _ := strconv.Atoi(c.DefaultQuery("limit", "20"))
	offset := (page - 1) * limit

	query = query.Offset(offset).Limit(limit).Order("created_at DESC")

	if err := query.Find(&deals).Error; err != nil {
		fmt.Printf("❌ Error fetching deals: %v\n", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch deals"})
		return
	}

	fmt.Printf("✅ Found %d approved deals\n", len(deals))

	// Debug: Let's also check total approved deals in database
	var totalApproved int64
	config.DB.Model(&models.Deal{}).Where("status = ? AND is_active = ?", "approved", true).Count(&totalApproved)
	fmt.Printf("📊 Total approved deals in database: %d\n", totalApproved)

	// Debug: Let's check all deals regardless of status
	var totalDeals int64
	config.DB.Model(&models.Deal{}).Count(&totalDeals)
	fmt.Printf("📊 Total deals in database (all statuses): %d\n", totalDeals)

	// Debug: Let's check pending deals
	var totalPending int64
	config.DB.Model(&models.Deal{}).Where("status = ?", "pending").Count(&totalPending)
	fmt.Printf("📊 Total pending deals in database: %d\n", totalPending)

	c.JSON(http.StatusOK, gin.H{
		"deals": deals,
		"debug": gin.H{
			"total_approved": totalApproved,
			"total_deals": totalDeals,
			"total_pending": totalPending,
			"returned_count": len(deals),
		},
	})
}

// MERCHANT ENDPOINT - Shows merchant's own deals (all statuses)
func GetMerchantDeals(c *gin.Context) {
	userID := c.GetUint("user_id")
	fmt.Printf("🔄 GetMerchantDeals called for merchant %d\n", userID)

	var deals []models.Deal
	query := config.DB.Preload("Category").Where("merchant_id = ?", userID)

	// Filter by status if provided
	if status := c.Query("status"); status != "" {
		query = query.Where("status = ?", status)
		fmt.Printf("🔍 Filtering by status: %s\n", status)
	}

	// Pagination
	page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
	limit, _ := strconv.Atoi(c.DefaultQuery("limit", "50"))
	offset := (page - 1) * limit

	query = query.Offset(offset).Limit(limit).Order("created_at DESC")

	if err := query.Find(&deals).Error; err != nil {
		fmt.Printf("❌ Error fetching merchant deals: %v\n", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch deals"})
		return
	}

	fmt.Printf("✅ Found %d deals for merchant %d\n", len(deals), userID)

	c.JSON(http.StatusOK, gin.H{"deals": deals})
}

// MERCHANT DASHBOARD STATS
func GetMerchantDashboardStats(c *gin.Context) {
	userID := c.GetUint("user_id")
	fmt.Printf("🔄 GetMerchantDashboardStats called for merchant %d\n", userID)

	var stats struct {
		TotalDeals    int64 `json:"total_deals"`
		ActiveDeals   int64 `json:"active_deals"`
		PendingDeals  int64 `json:"pending_deals"`
		RejectedDeals int64 `json:"rejected_deals"`
		TotalRevenue  float64 `json:"total_revenue"`
		TotalSales    int64 `json:"total_sales"`
	}

	// Get deal counts
	config.DB.Model(&models.Deal{}).Where("merchant_id = ?", userID).Count(&stats.TotalDeals)
	config.DB.Model(&models.Deal{}).Where("merchant_id = ? AND status = ?", userID, "approved").Count(&stats.ActiveDeals)
	config.DB.Model(&models.Deal{}).Where("merchant_id = ? AND status = ?", userID, "pending").Count(&stats.PendingDeals)
	config.DB.Model(&models.Deal{}).Where("merchant_id = ? AND status = ?", userID, "rejected").Count(&stats.RejectedDeals)

	// Calculate revenue and sales from approved deals
	var deals []models.Deal
	config.DB.Where("merchant_id = ? AND status = ?", userID, "approved").Find(&deals)
	
	for _, deal := range deals {
		stats.TotalSales += int64(deal.SoldQuantity)
		stats.TotalRevenue += float64(deal.SoldQuantity) * deal.DiscountPrice
	}

	// Get recent deals
	var recentDeals []models.Deal
	config.DB.Preload("Category").Where("merchant_id = ?", userID).
		Order("created_at DESC").Limit(5).Find(&recentDeals)

	fmt.Printf("✅ Dashboard stats: Total: %d, Active: %d, Pending: %d\n", 
		stats.TotalDeals, stats.ActiveDeals, stats.PendingDeals)

	c.JSON(http.StatusOK, gin.H{
		"stats": stats,
		"recent_deals": recentDeals,
	})
}

func GetDeal(c *gin.Context) {
	// Add explicit CORS headers
	c.Header("Access-Control-Allow-Origin", "*")
	c.Header("Access-Control-Allow-Methods", "GET, OPTIONS")
	c.Header("Access-Control-Allow-Headers", "Origin, Content-Type, Accept, Authorization, X-Requested-With")
	
	id := c.Param("id")
	fmt.Printf("🔄 GetDeal called for ID: %s\n", id)

	var deal models.Deal
	if err := config.DB.Preload("Category").Preload("Merchant").First(&deal, id).Error; err != nil {
		fmt.Printf("❌ Deal not found: %v\n", err)
		c.JSON(http.StatusNotFound, gin.H{"error": "Deal not found"})
		return
	}

	fmt.Printf("✅ Deal found: %s (Status: %s)\n", deal.Title, deal.Status)

	c.JSON(http.StatusOK, gin.H{"deal": deal})
}

func SearchDeals(c *gin.Context) {
	// Add explicit CORS headers
	c.Header("Access-Control-Allow-Origin", "*")
	c.Header("Access-Control-Allow-Methods", "GET, OPTIONS")
	c.Header("Access-Control-Allow-Headers", "Origin, Content-Type, Accept, Authorization, X-Requested-With")
	
	query := c.Query("q")
	if query == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Search query is required"})
		return
	}

	fmt.Printf("🔍 Searching deals for: %s\n", query)

	var deals []models.Deal
	// Only search in approved and active deals
	searchQuery := config.DB.Preload("Category").Preload("Merchant").
		Where("status = ? AND is_active = ?", "approved", true).
		Where("title ILIKE ? OR description ILIKE ? OR short_description ILIKE ?", 
			"%"+query+"%", "%"+query+"%", "%"+query+"%")

	if err := searchQuery.Find(&deals).Error; err != nil {
		fmt.Printf("❌ Search failed: %v\n", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Search failed"})
		return
	}

	fmt.Printf("✅ Search found %d deals\n", len(deals))

	c.JSON(http.StatusOK, gin.H{"deals": deals})
}

func UpdateDeal(c *gin.Context) {
	userID := c.GetUint("user_id")
	dealID := c.Param("id")
	
	fmt.Printf("🔄 UpdateDeal called by user %d for deal %s\n", userID, dealID)

	var deal models.Deal
	if err := config.DB.Where("id = ? AND merchant_id = ?", dealID, userID).First(&deal).Error; err != nil {
		fmt.Printf("❌ Deal not found or not owned by user: %v\n", err)
		c.JSON(http.StatusNotFound, gin.H{"error": "Deal not found"})
		return
	}

	var req CreateDealRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		fmt.Printf("❌ JSON binding error: %v\n", err)
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// Validate maximum 10 images
	if len(req.Images) > 10 {
		fmt.Println("❌ Too many images")
		c.JSON(http.StatusBadRequest, gin.H{"error": "Maximum 10 images allowed per deal"})
		return
	}

	// Convert []string to StringArray for database storage
	imageArray := models.StringArray(req.Images)

	// Update deal fields
	deal.Title = req.Title
	deal.Description = req.Description
	deal.ShortDescription = req.ShortDescription
	deal.OriginalPrice = req.OriginalPrice
	deal.DiscountPrice = req.DiscountPrice
	deal.ImageURL = req.ImageURL
	deal.Images = imageArray
	deal.CategoryID = req.CategoryID
	deal.StartDate = req.StartDate
	deal.EndDate = req.EndDate
	deal.MaxQuantity = req.MaxQuantity
	deal.Location = req.Location
	deal.FinePrints = req.FinePrints
	deal.Status = "pending" // Reset to pending after update - needs re-approval

	if err := config.DB.Save(&deal).Error; err != nil {
		fmt.Printf("❌ Failed to update deal: %v\n", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update deal"})
		return
	}

	fmt.Printf("✅ Deal updated successfully - Status reset to PENDING\n")

	c.JSON(http.StatusOK, gin.H{
		"message": "Deal updated successfully and is pending admin approval",
		"deal":    deal,
	})
}

func DeleteDeal(c *gin.Context) {
	userID := c.GetUint("user_id")
	dealID := c.Param("id")
	
	fmt.Printf("🔄 DeleteDeal called by user %d for deal %s\n", userID, dealID)

	var deal models.Deal
	if err := config.DB.Where("id = ? AND merchant_id = ?", dealID, userID).First(&deal).Error; err != nil {
		fmt.Printf("❌ Deal not found or not owned by user: %v\n", err)
		c.JSON(http.StatusNotFound, gin.H{"error": "Deal not found"})
		return
	}

	if err := config.DB.Delete(&deal).Error; err != nil {
		fmt.Printf("❌ Failed to delete deal: %v\n", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to delete deal"})
		return
	}

	fmt.Printf("✅ Deal deleted successfully\n")

	c.JSON(http.StatusOK, gin.H{"message": "Deal deleted successfully"})
}

// Admin functions with notifications
func GetPendingDeals(c *gin.Context) {
	fmt.Println("🔄 Admin: GetPendingDeals called")
	
	var deals []models.Deal
	if err := config.DB.Preload("Category").Preload("Merchant").
		Where("status = ?", "pending").
		Order("created_at ASC").
		Find(&deals).Error; err != nil {
		fmt.Printf("❌ Failed to fetch pending deals: %v\n", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch pending deals"})
		return
	}

	fmt.Printf("✅ Found %d pending deals\n", len(deals))

	c.JSON(http.StatusOK, gin.H{"deals": deals})
}

func ApproveDeal(c *gin.Context) {
	dealID := c.Param("id")
	fmt.Printf("🔄 Admin: ApproveDeal called for deal %s\n", dealID)

	var deal models.Deal
	if err := config.DB.Preload("Merchant").First(&deal, dealID).Error; err != nil {
		fmt.Printf("❌ Deal not found: %v\n", err)
		c.JSON(http.StatusNotFound, gin.H{"error": "Deal not found"})
		return
	}

	deal.Status = "approved"
	if err := config.DB.Save(&deal).Error; err != nil {
		fmt.Printf("❌ Failed to approve deal: %v\n", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to approve deal"})
		return
	}

	// Create notification for merchant
	notification := models.Notification{
		UserID:  deal.MerchantID,
		Title:   "Deal Approved! 🎉",
		Message: "Your deal '" + deal.Title + "' has been approved and is now live!",
		Type:    models.NotificationDealApproved,
		Data:    `{"deal_id": ` + dealID + `}`,
	}
	config.DB.Create(&notification)

	fmt.Printf("✅ Deal approved successfully - now visible to customers\n")

	c.JSON(http.StatusOK, gin.H{
		"message": "Deal approved successfully",
		"deal":    deal,
	})
}

func RejectDeal(c *gin.Context) {
	dealID := c.Param("id")
	fmt.Printf("🔄 Admin: RejectDeal called for deal %s\n", dealID)

	var req struct {
		Reason string `json:"reason"`
	}
	c.ShouldBindJSON(&req)

	var deal models.Deal
	if err := config.DB.Preload("Merchant").First(&deal, dealID).Error; err != nil {
		fmt.Printf("❌ Deal not found: %v\n", err)
		c.JSON(http.StatusNotFound, gin.H{"error": "Deal not found"})
		return
	}

	deal.Status = "rejected"
	if err := config.DB.Save(&deal).Error; err != nil {
		fmt.Printf("❌ Failed to reject deal: %v\n", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to reject deal"})
		return
	}

	// Create notification for merchant
	message := "Your deal '" + deal.Title + "' has been rejected."
	if req.Reason != "" {
		message += " Reason: " + req.Reason
	}

	notification := models.Notification{
		UserID:  deal.MerchantID,
		Title:   "Deal Rejected",
		Message: message,
		Type:    models.NotificationDealRejected,
		Data:    `{"deal_id": ` + dealID + `, "reason": "` + req.Reason + `"}`,
	}
	config.DB.Create(&notification)

	fmt.Printf("✅ Deal rejected successfully\n")

	c.JSON(http.StatusOK, gin.H{
		"message": "Deal rejected successfully",
		"deal":    deal,
	})
}

func GetAllUsers(c *gin.Context) {
	var users []models.User
	query := config.DB.Select("id, first_name, last_name, email, phone, role, status, is_verified, created_at")

	// Filter by role
	if role := c.Query("role"); role != "" {
		query = query.Where("role = ?", role)
	}

	// Pagination
	page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
	limit, _ := strconv.Atoi(c.DefaultQuery("limit", "20"))
	offset := (page - 1) * limit

	query = query.Offset(offset).Limit(limit).Order("created_at DESC")

	if err := query.Find(&users).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch users"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"users": users})
}

func UpdateUserStatus(c *gin.Context) {
	userID := c.Param("id")

	var req struct {
		Status string `json:"status" binding:"required"`
	}

	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	var user models.User
	if err := config.DB.First(&user, userID).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "User not found"})
		return
	}

	user.Status = req.Status
	if err := config.DB.Save(&user).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update user status"})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"message": "User status updated successfully",
		"user":    user,
	})
}
