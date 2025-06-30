package handlers

import (
	"fmt"
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"
	"snapadeal/config"
	"snapadeal/models"
)

// Admin Dashboard Stats
func GetAdminDashboardStats(c *gin.Context) {
	fmt.Println("🔄 Admin: GetAdminDashboardStats called")

	var stats struct {
		TotalUsers      int64 `json:"total_users"`
		TotalMerchants  int64 `json:"total_merchants"`
		TotalCustomers  int64 `json:"total_customers"`
		TotalDeals      int64 `json:"total_deals"`
		PendingDeals    int64 `json:"pending_deals"`
		ApprovedDeals   int64 `json:"approved_deals"`
		RejectedDeals   int64 `json:"rejected_deals"`
		TotalRevenue    float64 `json:"total_revenue"`
		TotalSales      int64 `json:"total_sales"`
	}

	// Get user counts
	config.DB.Model(&models.User{}).Count(&stats.TotalUsers)
	config.DB.Model(&models.User{}).Where("role = ?", "merchant").Count(&stats.TotalMerchants)
	config.DB.Model(&models.User{}).Where("role = ?", "customer").Count(&stats.TotalCustomers)

	// Get deal counts
	config.DB.Model(&models.Deal{}).Count(&stats.TotalDeals)
	config.DB.Model(&models.Deal{}).Where("status = ?", "pending").Count(&stats.PendingDeals)
	config.DB.Model(&models.Deal{}).Where("status = ?", "approved").Count(&stats.ApprovedDeals)
	config.DB.Model(&models.Deal{}).Where("status = ?", "rejected").Count(&stats.RejectedDeals)

	// Calculate revenue and sales from approved deals
	var deals []models.Deal
	config.DB.Where("status = ?", "approved").Find(&deals)
	
	for _, deal := range deals {
		stats.TotalSales += int64(deal.SoldQuantity)
		stats.TotalRevenue += float64(deal.SoldQuantity) * deal.DiscountPrice
	}

	// Get recent activity (last 10 deals)
	var recentDeals []models.Deal
	config.DB.Preload("Category").Preload("Merchant").
		Order("created_at DESC").Limit(10).Find(&recentDeals)

	// Create activity from recent deals
	var recentActivity []map[string]interface{}
	for _, deal := range recentDeals {
		activity := map[string]interface{}{
			"id":          deal.ID,
			"type":        "deal_" + deal.Status,
			"description": fmt.Sprintf("Deal '%s' by %s %s", deal.Title, deal.Merchant.FirstName, deal.Merchant.LastName),
			"timestamp":   deal.CreatedAt,
			"status":      deal.Status,
		}
		recentActivity = append(recentActivity, activity)
	}

	fmt.Printf("✅ Admin stats: Users: %d, Merchants: %d, Deals: %d, Pending: %d\n", 
		stats.TotalUsers, stats.TotalMerchants, stats.TotalDeals, stats.PendingDeals)

	c.JSON(http.StatusOK, gin.H{
		"stats": stats,
		"recent_activity": recentActivity,
	})
}

// Admin - Get ALL deals (all statuses, all merchants)
func GetAllDealsAdmin(c *gin.Context) {
	fmt.Println("🔄 Admin: GetAllDealsAdmin called")

	var deals []models.Deal
	query := config.DB.Preload("Category").Preload("Merchant")

	// Filter by status if provided
	if status := c.Query("status"); status != "" {
		query = query.Where("status = ?", status)
		fmt.Printf("🔍 Filtering by status: %s\n", status)
	}

	// Filter by merchant if provided
	if merchantID := c.Query("merchant_id"); merchantID != "" {
		query = query.Where("merchant_id = ?", merchantID)
		fmt.Printf("🔍 Filtering by merchant: %s\n", merchantID)
	}

	// Pagination
	page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
	limit, _ := strconv.Atoi(c.DefaultQuery("limit", "50"))
	offset := (page - 1) * limit

	query = query.Offset(offset).Limit(limit).Order("created_at DESC")

	if err := query.Find(&deals).Error; err != nil {
		fmt.Printf("❌ Error fetching all deals: %v\n", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch deals"})
		return
	}

	fmt.Printf("✅ Found %d deals for admin\n", len(deals))
	c.JSON(http.StatusOK, gin.H{"deals": deals})
}

// Admin - Get deal statistics by status
func GetDealStatistics(c *gin.Context) {
	fmt.Println("🔄 Admin: GetDealStatistics called")

	var stats []struct {
		Status string `json:"status"`
		Count  int64  `json:"count"`
	}

	config.DB.Model(&models.Deal{}).
		Select("status, COUNT(*) as count").
		Group("status").
		Find(&stats)

	// Get deals by category
	var categoryStats []struct {
		CategoryName string `json:"category_name"`
		Count        int64  `json:"count"`
	}

	config.DB.Table("deals").
		Select("categories.name as category_name, COUNT(*) as count").
		Joins("LEFT JOIN categories ON deals.category_id = categories.id").
		Where("deals.status = ?", "approved").
		Group("categories.name").
		Find(&categoryStats)

	fmt.Printf("✅ Deal statistics generated\n")
	c.JSON(http.StatusOK, gin.H{
		"status_stats": stats,
		"category_stats": categoryStats,
	})
}

// Admin - Get merchant statistics
func GetMerchantStatistics(c *gin.Context) {
	fmt.Println("🔄 Admin: GetMerchantStatistics called")

	var merchantStats []struct {
		MerchantID    uint    `json:"merchant_id"`
		MerchantName  string  `json:"merchant_name"`
		MerchantEmail string  `json:"merchant_email"`
		TotalDeals    int64   `json:"total_deals"`
		ApprovedDeals int64   `json:"approved_deals"`
		PendingDeals  int64   `json:"pending_deals"`
		TotalRevenue  float64 `json:"total_revenue"`
	}

	// This is a complex query, so we'll do it step by step
	var merchants []models.User
	config.DB.Where("role = ?", "merchant").Find(&merchants)

	for _, merchant := range merchants {
		var stat struct {
			MerchantID    uint    `json:"merchant_id"`
			MerchantName  string  `json:"merchant_name"`
			MerchantEmail string  `json:"merchant_email"`
			TotalDeals    int64   `json:"total_deals"`
			ApprovedDeals int64   `json:"approved_deals"`
			PendingDeals  int64   `json:"pending_deals"`
			TotalRevenue  float64 `json:"total_revenue"`
		}

		stat.MerchantID = merchant.ID
		stat.MerchantName = merchant.FirstName + " " + merchant.LastName
		stat.MerchantEmail = merchant.Email

		// Count deals
		config.DB.Model(&models.Deal{}).Where("merchant_id = ?", merchant.ID).Count(&stat.TotalDeals)
		config.DB.Model(&models.Deal{}).Where("merchant_id = ? AND status = ?", merchant.ID, "approved").Count(&stat.ApprovedDeals)
		config.DB.Model(&models.Deal{}).Where("merchant_id = ? AND status = ?", merchant.ID, "pending").Count(&stat.PendingDeals)

		// Calculate revenue
		var deals []models.Deal
		config.DB.Where("merchant_id = ? AND status = ?", merchant.ID, "approved").Find(&deals)
		for _, deal := range deals {
			stat.TotalRevenue += float64(deal.SoldQuantity) * deal.DiscountPrice
		}

		merchantStats = append(merchantStats, stat)
	}

	fmt.Printf("✅ Merchant statistics for %d merchants\n", len(merchantStats))
	c.JSON(http.StatusOK, gin.H{
		"merchant_stats": merchantStats,
	})
}
