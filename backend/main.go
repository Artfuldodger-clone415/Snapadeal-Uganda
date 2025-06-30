package main

import (
	"log"
	"net/http"
	"os"
	"path/filepath"
	"strings"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
	"github.com/joho/godotenv"

	"snapadeal/config"
	"snapadeal/handlers"
	"snapadeal/middleware"
	"snapadeal/models"
)

func main() {
	// Load environment variables
	if err := godotenv.Load(); err != nil {
		log.Println("No .env file found, using default values")
	}

	// Initialize database
	config.ConnectDatabase()

	// Auto migrate models
	log.Println("Running database migrations...")
	config.DB.AutoMigrate(&models.User{}, &models.Deal{}, &models.Transaction{}, &models.Category{}, &models.Notification{})

	// Create default admin user
	models.CreateDefaultAdmin()

	// Seed database with categories
	models.SeedDatabase()

	// Initialize Gin router
	r := gin.Default()

	// Disable automatic redirect for trailing slashes
	r.RedirectTrailingSlash = false

	// IMPROVED: Serve static files (uploaded images) with proper CORS headers and security
	r.GET("/uploads/*filepath", func(c *gin.Context) {
		// Set CORS headers for images
		c.Header("Access-Control-Allow-Origin", "*")
		c.Header("Access-Control-Allow-Methods", "GET, OPTIONS")
		c.Header("Access-Control-Allow-Headers", "Origin, Content-Type, Accept, Authorization")
		c.Header("Cache-Control", "public, max-age=86400") // Cache for 1 day

		// Get the file path
		requestedPath := c.Param("filepath")
		
		// Security: Prevent directory traversal attacks
		if strings.Contains(requestedPath, "..") {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid file path"})
			return
		}

		// Clean the path
		cleanPath := filepath.Clean(requestedPath)
		fullPath := filepath.Join("./uploads", cleanPath)

		// Check if file exists
		if _, err := os.Stat(fullPath); os.IsNotExist(err) {
			c.JSON(http.StatusNotFound, gin.H{"error": "File not found"})
			return
		}

		// Serve the file
		c.File(fullPath)
	})

	// Enhanced CORS Configuration for all apps
	r.Use(cors.New(cors.Config{
		AllowOrigins: []string{
			"http://localhost:3000", "http://127.0.0.1:3000", // Customer app
			"http://localhost:3001", "http://127.0.0.1:3001", // Merchant app  
			"http://localhost:3002", "http://127.0.0.1:3002", // Admin app
			"https://localhost:3000", "https://localhost:3001", "https://localhost:3002",
		},
		AllowMethods:     []string{"GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"},
		AllowHeaders:     []string{"Origin", "Content-Type", "Accept", "Authorization", "X-Requested-With", "Access-Control-Request-Method", "Access-Control-Request-Headers"},
		ExposeHeaders:    []string{"Content-Length", "Access-Control-Allow-Origin", "Access-Control-Allow-Headers"},
		AllowCredentials: true,
		MaxAge:           12 * 3600,
	}))

	// Additional CORS middleware for extra safety
	r.Use(func(c *gin.Context) {
		origin := c.Request.Header.Get("Origin")
		// Allow specific origins for different apps
		allowedOrigins := []string{
			"http://localhost:3000", "http://127.0.0.1:3000", // Customer
			"http://localhost:3001", "http://127.0.0.1:3001", // Merchant
			"http://localhost:3002", "http://127.0.0.1:3002", // Admin
		}

		for _, allowedOrigin := range allowedOrigins {
			if origin == allowedOrigin {
				c.Header("Access-Control-Allow-Origin", origin)
				break
			}
		}

		if origin == "" {
			c.Header("Access-Control-Allow-Origin", "*")
		}

		c.Header("Access-Control-Allow-Methods", "GET,POST,PUT,DELETE,OPTIONS,PATCH")
		c.Header("Access-Control-Allow-Headers", "Origin,Content-Type,Accept,Authorization,X-Requested-With,Access-Control-Request-Method,Access-Control-Request-Headers")
		c.Header("Access-Control-Expose-Headers", "Content-Length,Access-Control-Allow-Origin,Access-Control-Allow-Headers")
		c.Header("Access-Control-Allow-Credentials", "true")

		if c.Request.Method == "OPTIONS" {
			c.AbortWithStatus(http.StatusNoContent)
			return
		}

		c.Next()
	})

	// Health check endpoint
	r.GET("/health", func(c *gin.Context) {
		c.JSON(http.StatusOK, gin.H{
			"status":   "healthy",
			"database": "connected",
			"message":  "Snapadeal API is running",
		})
	})

	// API routes
	api := r.Group("/api/v1")
	{
		// Auth routes - ENHANCED WITH EMAIL VERIFICATION
		auth := api.Group("/auth")
		{
			auth.POST("/register", handlers.Register)
			auth.POST("/verify-otp", handlers.VerifyOTP)
			auth.POST("/resend-otp", handlers.ResendOTP)
			auth.POST("/login", handlers.Login)
			auth.POST("/forgot-password", handlers.ForgotPassword)
			auth.POST("/reset-password", handlers.ResetPassword)
		}

		// User routes (protected)
		users := api.Group("/users")
		users.Use(middleware.AuthMiddleware())
		{
			users.GET("/profile", handlers.GetProfile)
			users.PUT("/profile", handlers.UpdateProfile)
		}

		// Upload routes (protected)
		upload := api.Group("/upload")
		upload.Use(middleware.AuthMiddleware())
		{
			upload.POST("/image", handlers.UploadImage)
			upload.POST("/images", handlers.UploadMultipleImages)
		}

		// PUBLIC Deal routes - ONLY APPROVED DEALS (for customers)
		deals := api.Group("/deals")
		{
			deals.GET("", handlers.GetDeals)            // Without trailing slash
			deals.GET("/", handlers.GetDeals)           // With trailing slash
			deals.GET("/:id", handlers.GetDeal)         // Individual deal
			deals.GET("/search", handlers.SearchDeals)  // Search deals
		}

		// MERCHANT Deal routes (protected) - Shows merchant's own deals
		merchantDeals := api.Group("/merchant")
		merchantDeals.Use(middleware.AuthMiddleware(), middleware.RoleMiddleware("merchant"))
		{
			merchantDeals.GET("/deals", handlers.GetMerchantDeals)           // Merchant's own deals (all statuses)
			merchantDeals.GET("/dashboard/stats", handlers.GetMerchantDashboardStats) // Dashboard stats
			merchantDeals.POST("/deals", handlers.CreateDeal)               // Create deal
			merchantDeals.PUT("/deals/:id", handlers.UpdateDeal)            // Update deal
			merchantDeals.DELETE("/deals/:id", handlers.DeleteDeal)         // Delete deal
		}

		// Legacy protected deal routes (for backward compatibility)
		protectedDeals := api.Group("/deals")
		protectedDeals.Use(middleware.AuthMiddleware())
		{
			protectedDeals.POST("", middleware.RoleMiddleware("merchant"), handlers.CreateDeal)
			protectedDeals.POST("/", middleware.RoleMiddleware("merchant"), handlers.CreateDeal)
			protectedDeals.PUT("/:id", middleware.RoleMiddleware("merchant"), handlers.UpdateDeal)
			protectedDeals.DELETE("/:id", middleware.RoleMiddleware("merchant"), handlers.DeleteDeal)
		}

		// Transaction routes (protected) - ENHANCED WITH FLUTTERWAVE
		transactions := api.Group("/transactions")
		transactions.Use(middleware.AuthMiddleware())
		{
			transactions.POST("", handlers.CreateTransaction)     // Create transaction
			transactions.POST("/", handlers.CreateTransaction)    // Create transaction - with trailing slash
			transactions.GET("", handlers.GetUserTransactions)    // Get user transactions
			transactions.GET("/", handlers.GetUserTransactions)   // Get user transactions - with trailing slash
		}

		// Payment routes - FLUTTERWAVE INTEGRATION
		payment := api.Group("/payment")
		{
			payment.GET("/verify", handlers.VerifyPayment)      // Flutterwave callback
			payment.GET("/simulate/:id", handlers.SimulatePayment) // Demo payment completion (fallback)
		}

		// Notification routes (protected)
		notifications := api.Group("/notifications")
		notifications.Use(middleware.AuthMiddleware())
		{
			notifications.GET("/", handlers.GetNotifications)
			notifications.PUT("/:id/read", handlers.MarkNotificationAsRead)
			notifications.PUT("/read-all", handlers.MarkAllNotificationsAsRead)
			notifications.DELETE("/:id", handlers.DeleteNotification)
		}

		// Admin routes - ENHANCED WITH NEW ENDPOINTS
		admin := api.Group("/admin")
		admin.Use(middleware.AuthMiddleware(), middleware.RoleMiddleware("admin"))
		{
			// Dashboard and statistics
			admin.GET("/dashboard/stats", handlers.GetAdminDashboardStats)
			admin.GET("/deals/statistics", handlers.GetDealStatistics)
			admin.GET("/merchants/statistics", handlers.GetMerchantStatistics)

			// Deal management - ALL DEALS (all statuses, all merchants)
			admin.GET("/deals", handlers.GetAllDealsAdmin)              // All deals for admin
			admin.GET("/deals/pending", handlers.GetPendingDeals)       // Pending deals only
			admin.PUT("/deals/:id/approve", handlers.ApproveDeal)       // Approve deal
			admin.PUT("/deals/:id/reject", handlers.RejectDeal)         // Reject deal

			// User management
			admin.GET("/users", handlers.GetAllUsers)
			admin.PUT("/users/:id/status", handlers.UpdateUserStatus)

			// Admin notifications
			admin.POST("/notifications/broadcast", handlers.BroadcastNotification)
			admin.GET("/notifications/stats", handlers.GetNotificationStats)
		}

		// Category routes (PUBLIC)
		categories := api.Group("/categories")
		{
			categories.GET("", handlers.GetCategories)   // Without trailing slash
			categories.GET("/", handlers.GetCategories)  // With trailing slash
		}
	}

	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}

	log.Printf("🚀 Snapadeal API Server starting on port %s", port)
	log.Printf("📊 Database: SQLite (snapadeal.db)")
	log.Printf("🔐 Default Admin: admin@snapadeal.com / admin123")
	log.Printf("🌐 CORS: CONFIGURED FOR ALL APPS")
	log.Printf("   - Customer App: http://localhost:3000")
	log.Printf("   - Merchant App: http://localhost:3001")
	log.Printf("   - Admin App: http://localhost:3002")
	log.Printf("🔄 Trailing slash redirect: DISABLED")
	log.Printf("📧 EMAIL AUTHENTICATION SYSTEM:")
	log.Printf("   - OTP verification for registration")
	log.Printf("   - Password recovery via email")
	log.Printf("   - Email/Phone login support")
	log.Printf("🔔 Notifications system enabled")
	log.Printf("📁 Static files served from /uploads with CORS and security")
	log.Printf("📂 Categories endpoint: PUBLIC (no auth required)")
	log.Printf("🛠️  Enhanced Authentication Endpoints:")
	log.Printf("   - POST /api/v1/auth/register (with OTP)")
	log.Printf("   - POST /api/v1/auth/verify-otp")
	log.Printf("   - POST /api/v1/auth/resend-otp")
	log.Printf("   - POST /api/v1/auth/login (email or phone)")
	log.Printf("   - POST /api/v1/auth/forgot-password")
	log.Printf("   - POST /api/v1/auth/reset-password")
	log.Printf("⚖️  Deal approval workflow:")
	log.Printf("   1. Merchant creates deal → Status: PENDING")
	log.Printf("   2. Admin approves deal → Status: APPROVED (visible to customers)")
	log.Printf("   3. Public API only shows APPROVED deals")
	log.Printf("🏪 Merchant endpoints: /api/v1/merchant/*")
	log.Printf("👑 Admin endpoints: /api/v1/admin/*")
	log.Printf("💳 Transaction endpoints:")
	log.Printf("   - POST /api/v1/transactions (create transaction with Flutterwave)")
	log.Printf("   - GET /api/v1/transactions (user transactions)")
	log.Printf("   - GET /api/v1/payment/verify (Flutterwave callback)")
	log.Printf("   - GET /api/v1/payment/simulate/:id (demo payment fallback)")

	// Check email configuration
	smtpHost := os.Getenv("SMTP_HOST")
	smtpUser := os.Getenv("SMTP_USER")
	if smtpHost != "" && smtpUser != "" && smtpUser != "your-email@gmail.com" {
		log.Printf("📧 Email service: CONFIGURED ✅")
		log.Printf("   - SMTP Host: %s", smtpHost)
		log.Printf("   - From: %s", smtpUser)
	} else {
		log.Printf("📧 Email service: NOT CONFIGURED ⚠️")
		log.Printf("   - OTP and password reset emails will be skipped")
		log.Printf("   - Update SMTP_* variables in .env to enable email")
	}

	// Check Flutterwave configuration
	flwPubKey := os.Getenv("FLUTTERWAVE_PUBLIC_KEY")
	flwSecKey := os.Getenv("FLUTTERWAVE_SECRET_KEY")
	if flwPubKey != "" && flwSecKey != "" &&
		flwPubKey != "FLWPUBK_TEST-your-public-key-here" &&
		flwSecKey != "FLWSECK_TEST-your-secret-key-here" {
		log.Printf("🔒 Flutterwave Integration: CONFIGURED ✅")
	} else {
		log.Printf("🔒 Flutterwave Integration: USING SIMULATION MODE ⚠️")
		log.Printf("   📝 To enable live payments:")
		log.Printf("      1. Get your keys from https://dashboard.flutterwave.com/")
		log.Printf("      2. Update FLUTTERWAVE_PUBLIC_KEY and FLUTTERWAVE_SECRET_KEY in .env")
	}

	log.Fatal(http.ListenAndServe(":"+port, r))
}
