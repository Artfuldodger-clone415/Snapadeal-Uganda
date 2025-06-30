package handlers

import (
	"fmt"
	"net/http"
	"os"
	"strings"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/golang-jwt/jwt/v4"
	"snapadeal/config"
	"snapadeal/models"
	"snapadeal/services"
)

type RegisterRequest struct {
	FirstName string `json:"first_name" binding:"required"`
	LastName  string `json:"last_name" binding:"required"`
	Email     string `json:"email" binding:"required,email"`
	Phone     string `json:"phone" binding:"required"`
	Password  string `json:"password" binding:"required,min=6"`
	Role      string `json:"role"` // customer, merchant, admin
}

type LoginRequest struct {
	EmailOrPhone string `json:"email_or_phone" binding:"required"`
	Password     string `json:"password" binding:"required"`
}

type VerifyOTPRequest struct {
	Email string `json:"email" binding:"required,email"`
	OTP   string `json:"otp" binding:"required,len=6"`
}

type ResendOTPRequest struct {
	Email string `json:"email" binding:"required,email"`
}

type ForgotPasswordRequest struct {
	Email string `json:"email" binding:"required,email"`
}

type ResetPasswordRequest struct {
	Token    string `json:"token" binding:"required"`
	Password string `json:"password" binding:"required,min=6"`
}

func Register(c *gin.Context) {
	fmt.Println("🔄 Register handler called")
	
	var req RegisterRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		fmt.Printf("❌ JSON binding error: %v\n", err)
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	fmt.Printf("📝 Registration request: %+v\n", req)

	// Check if user already exists
	var existingUser models.User
	if err := config.DB.Where("email = ? OR phone = ?", req.Email, req.Phone).First(&existingUser).Error; err == nil {
		fmt.Println("❌ User already exists")
		c.JSON(http.StatusConflict, gin.H{"error": "User with this email or phone already exists"})
		return
	}

	// Set default role
	if req.Role == "" {
		req.Role = "customer"
	}

	// Validate role - NOW INCLUDES ADMIN
	if req.Role != "customer" && req.Role != "merchant" && req.Role != "admin" {
		fmt.Printf("❌ Invalid role: %s\n", req.Role)
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid role. Must be 'customer', 'merchant', or 'admin'"})
		return
	}

	// Create user with pending status
	user := models.User{
		FirstName:  req.FirstName,
		LastName:   req.LastName,
		Email:      req.Email,
		Phone:      req.Phone,
		Password:   req.Password,
		Role:       req.Role,
		Status:     "pending", // User must verify email first
		IsVerified: false,
	}

	if err := user.HashPassword(); err != nil {
		fmt.Printf("❌ Password hashing error: %v\n", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to hash password"})
		return
	}

	// Generate OTP
	if err := user.GenerateOTP(); err != nil {
		fmt.Printf("❌ OTP generation error: %v\n", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to generate OTP"})
		return
	}

	if err := config.DB.Create(&user).Error; err != nil {
		fmt.Printf("❌ Database error: %v\n", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create user"})
		return
	}

	fmt.Printf("✅ User created with ID: %d, Role: %s\n", user.ID, user.Role)

	// Send OTP email
	emailService := services.NewEmailService()
	if err := emailService.SendOTPEmail(user.Email, user.FirstName, user.OTPCode); err != nil {
		fmt.Printf("⚠️ Failed to send OTP email: %v\n", err)
		// Don't fail registration if email fails
	} else {
		fmt.Printf("📧 OTP email sent to: %s\n", user.Email)
	}

	// Custom message based on role
	var message string
	switch req.Role {
	case "admin":
		message = "Admin registration successful! Please check your email for the OTP code to verify your account."
	case "merchant":
		message = "Merchant registration successful! Please check your email for the OTP code to verify your account."
	default:
		message = "Registration successful! Please check your email for the OTP code to verify your account."
	}

	c.JSON(http.StatusCreated, gin.H{
		"message": message,
		"email":   user.Email,
		"status":  "pending_verification",
		"role":    user.Role,
	})
}

func VerifyOTP(c *gin.Context) {
	fmt.Println("🔄 VerifyOTP handler called")
	
	var req VerifyOTPRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		fmt.Printf("❌ JSON binding error: %v\n", err)
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	fmt.Printf("📝 OTP verification request for: %s\n", req.Email)

	// Find user
	var user models.User
	if err := config.DB.Where("email = ?", req.Email).First(&user).Error; err != nil {
		fmt.Println("❌ User not found")
		c.JSON(http.StatusNotFound, gin.H{"error": "User not found"})
		return
	}

	// Verify OTP
	if !user.VerifyOTP(req.OTP) {
		fmt.Println("❌ Invalid or expired OTP")
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid or expired OTP"})
		return
	}

	// Update user status
	user.Status = "active"
	user.IsVerified = true
	now := time.Now()
	user.EmailVerifiedAt = &now
	user.ClearOTP()

	if err := config.DB.Save(&user).Error; err != nil {
		fmt.Printf("❌ Failed to update user: %v\n", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to verify account"})
		return
	}

	fmt.Printf("✅ User verified successfully: %s (Role: %s)\n", user.Email, user.Role)

	// Send welcome email
	emailService := services.NewEmailService()
	if err := emailService.SendWelcomeEmail(user.Email, user.FirstName, user.Role); err != nil {
		fmt.Printf("⚠️ Failed to send welcome email: %v\n", err)
	}

	// Generate JWT token
	token, err := generateJWT(user.ID, user.Role)
	if err != nil {
		fmt.Printf("❌ Token generation error: %v\n", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to generate token"})
		return
	}

	// Custom message based on role
	var message string
	switch user.Role {
	case "admin":
		message = "Admin account verified successfully! Welcome to Snapadeal Admin Portal!"
	case "merchant":
		message = "Merchant account verified successfully! Welcome to Snapadeal!"
	default:
		message = "Account verified successfully! Welcome to Snapadeal!"
	}

	c.JSON(http.StatusOK, gin.H{
		"message": message,
		"user":    user,
		"token":   token,
	})
}

func ResendOTP(c *gin.Context) {
	fmt.Println("🔄 ResendOTP handler called")
	
	var req ResendOTPRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		fmt.Printf("❌ JSON binding error: %v\n", err)
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// Find user
	var user models.User
	if err := config.DB.Where("email = ?", req.Email).First(&user).Error; err != nil {
		fmt.Println("❌ User not found")
		c.JSON(http.StatusNotFound, gin.H{"error": "User not found"})
		return
	}

	// Check if user is already verified
	if user.IsVerified {
		fmt.Println("❌ User already verified")
		c.JSON(http.StatusBadRequest, gin.H{"error": "Account is already verified"})
		return
	}

	// Generate new OTP
	if err := user.GenerateOTP(); err != nil {
		fmt.Printf("❌ OTP generation error: %v\n", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to generate OTP"})
		return
	}

	if err := config.DB.Save(&user).Error; err != nil {
		fmt.Printf("❌ Failed to save user: %v\n", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to resend OTP"})
		return
	}

	// Send OTP email
	emailService := services.NewEmailService()
	if err := emailService.SendOTPEmail(user.Email, user.FirstName, user.OTPCode); err != nil {
		fmt.Printf("❌ Failed to send OTP email: %v\n", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to send OTP email"})
		return
	}

	fmt.Printf("📧 OTP resent to: %s\n", user.Email)

	c.JSON(http.StatusOK, gin.H{
		"message": "OTP has been resent to your email",
	})
}

func Login(c *gin.Context) {
	fmt.Println("🔄 Login handler called")
	
	var req LoginRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		fmt.Printf("❌ JSON binding error: %v\n", err)
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	fmt.Printf("📝 Login request for: %s\n", req.EmailOrPhone)

	// Find user by email or phone
	var user models.User
	var err error
	
	// Check if input contains @ (email) or is phone number
	if strings.Contains(req.EmailOrPhone, "@") {
		err = config.DB.Where("email = ?", req.EmailOrPhone).First(&user).Error
	} else {
		// Clean phone number (remove spaces, dashes, etc.)
		cleanPhone := strings.ReplaceAll(req.EmailOrPhone, " ", "")
		cleanPhone = strings.ReplaceAll(cleanPhone, "-", "")
		err = config.DB.Where("phone = ? OR phone = ?", req.EmailOrPhone, cleanPhone).First(&user).Error
	}

	if err != nil {
		fmt.Println("❌ User not found")
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid credentials"})
		return
	}

	// Check password
	if !user.CheckPassword(req.Password) {
		fmt.Println("❌ Invalid password")
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid credentials"})
		return
	}

	// Check if user is verified
	if !user.IsVerified {
		fmt.Println("❌ User not verified")
		c.JSON(http.StatusUnauthorized, gin.H{
			"error": "Please verify your email address first",
			"email": user.Email,
			"status": "pending_verification",
		})
		return
	}

	// Check if user is active
	if user.Status != "active" {
		fmt.Printf("❌ User status: %s\n", user.Status)
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Account is not active"})
		return
	}

	// Update last login
	user.UpdateLastLogin()
	config.DB.Save(&user)

	// Generate JWT token
	token, err := generateJWT(user.ID, user.Role)
	if err != nil {
		fmt.Printf("❌ Token generation error: %v\n", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to generate token"})
		return
	}

	fmt.Printf("✅ Login successful for user: %s (Role: %s)\n", user.Email, user.Role)

	c.JSON(http.StatusOK, gin.H{
		"message": "Login successful",
		"user":    user,
		"token":   token,
	})
}

func ForgotPassword(c *gin.Context) {
	fmt.Println("🔄 ForgotPassword handler called")
	
	var req ForgotPasswordRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		fmt.Printf("❌ JSON binding error: %v\n", err)
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	fmt.Printf("📝 Password reset request for: %s\n", req.Email)

	// Find user
	var user models.User
	if err := config.DB.Where("email = ?", req.Email).First(&user).Error; err != nil {
		// Don't reveal if email exists or not for security
		fmt.Println("❌ User not found, but returning success for security")
		c.JSON(http.StatusOK, gin.H{"message": "If the email exists, a reset link has been sent"})
		return
	}

	// Generate reset token
	if err := user.GenerateResetToken(); err != nil {
		fmt.Printf("❌ Reset token generation error: %v\n", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to generate reset token"})
		return
	}

	if err := config.DB.Save(&user).Error; err != nil {
		fmt.Printf("❌ Failed to save user: %v\n", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to process reset request"})
		return
	}

	// Determine the correct frontend URL based on user role
	var frontendURL string
	switch user.Role {
	case "admin":
		frontendURL = os.Getenv("ADMIN_APP_URL")
		if frontendURL == "" {
			frontendURL = "http://localhost:3002"
		}
	case "merchant":
		frontendURL = os.Getenv("MERCHANT_APP_URL")
		if frontendURL == "" {
			frontendURL = "http://localhost:3001"
		}
	default:
		frontendURL = os.Getenv("CUSTOMER_APP_URL")
		if frontendURL == "" {
			frontendURL = "http://localhost:3000"
		}
	}

	resetURL := fmt.Sprintf("%s/reset-password?token=%s", frontendURL, user.ResetToken)

	// Send reset email
	emailService := services.NewEmailService()
	if err := emailService.SendPasswordResetEmail(user.Email, user.FirstName, resetURL); err != nil {
		fmt.Printf("❌ Failed to send reset email: %v\n", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to send reset email"})
		return
	}

	fmt.Printf("📧 Password reset email sent to: %s\n", user.Email)

	c.JSON(http.StatusOK, gin.H{"message": "Password reset link sent to your email"})
}

func ResetPassword(c *gin.Context) {
	fmt.Println("🔄 ResetPassword handler called")
	
	var req ResetPasswordRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		fmt.Printf("❌ JSON binding error: %v\n", err)
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	fmt.Printf("📝 Password reset with token: %s\n", req.Token)

	// Find user with reset token
	var user models.User
	if err := config.DB.Where("reset_token = ?", req.Token).First(&user).Error; err != nil {
		fmt.Println("❌ Invalid reset token")
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid or expired reset token"})
		return
	}

	// Verify token
	if !user.VerifyResetToken(req.Token) {
		fmt.Println("❌ Reset token expired")
		c.JSON(http.StatusBadRequest, gin.H{"error": "Reset token has expired"})
		return
	}

	// Update password
	user.Password = req.Password
	if err := user.HashPassword(); err != nil {
		fmt.Printf("❌ Password hashing error: %v\n", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to hash password"})
		return
	}

	// Clear reset token
	user.ClearResetToken()

	if err := config.DB.Save(&user).Error; err != nil {
		fmt.Printf("❌ Failed to save user: %v\n", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to reset password"})
		return
	}

	fmt.Printf("✅ Password reset successful for user: %s\n", user.Email)

	c.JSON(http.StatusOK, gin.H{"message": "Password reset successful"})
}

func generateJWT(userID uint, role string) (string, error) {
	claims := jwt.MapClaims{
		"user_id": userID,
		"role":    role,
		"exp":     time.Now().Add(time.Hour * 24 * 7).Unix(), // 7 days
	}

	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	secret := os.Getenv("JWT_SECRET")
	if secret == "" {
		secret = "your-secret-key"
	}

	return token.SignedString([]byte(secret))
}

func GetProfile(c *gin.Context) {
	userID := c.GetUint("user_id")
	var user models.User

	if err := config.DB.First(&user, userID).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "User not found"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"user": user})
}

func UpdateProfile(c *gin.Context) {
	userID := c.GetUint("user_id")
	var user models.User

	if err := config.DB.First(&user, userID).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "User not found"})
		return
	}

	var req struct {
		FirstName string `json:"first_name"`
		LastName  string `json:"last_name"`
		Phone     string `json:"phone"`
	}

	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// Update user
	if req.FirstName != "" {
		user.FirstName = req.FirstName
	}
	if req.LastName != "" {
		user.LastName = req.LastName
	}
	if req.Phone != "" {
		user.Phone = req.Phone
	}

	if err := config.DB.Save(&user).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update profile"})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"message": "Profile updated successfully",
		"user":    user,
	})
}
