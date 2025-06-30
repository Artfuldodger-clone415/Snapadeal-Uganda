package main

import (
	"fmt"
	"log"

	"github.com/joho/godotenv"
	"snapadeal/config"
	"snapadeal/models"
)

func main() {
	// Load environment variables
	if err := godotenv.Load(); err != nil {
		log.Println("No .env file found, using default values")
	}

	// Initialize database
	config.ConnectDatabase()

	fmt.Println("🔍 Checking deals in database...")

	// Check total deals
	var totalDeals int64
	config.DB.Model(&models.Deal{}).Count(&totalDeals)
	fmt.Printf("📊 Total deals: %d\n", totalDeals)

	// Check approved deals
	var approvedDeals int64
	config.DB.Model(&models.Deal{}).Where("status = ? AND is_active = ?", "approved", true).Count(&approvedDeals)
	fmt.Printf("✅ Approved deals: %d\n", approvedDeals)

	// Check pending deals
	var pendingDeals int64
	config.DB.Model(&models.Deal{}).Where("status = ?", "pending").Count(&pendingDeals)
	fmt.Printf("⏳ Pending deals: %d\n", pendingDeals)

	// List all deals with their status
	var deals []models.Deal
	config.DB.Select("id, title, status, is_active, merchant_id").Find(&deals)

	fmt.Println("\n📋 All deals:")
	for _, deal := range deals {
		fmt.Printf("  ID: %d | Title: %s | Status: %s | Active: %t | Merchant: %d\n", 
			deal.ID, deal.Title, deal.Status, deal.IsActive, deal.MerchantID)
	}

	if approvedDeals == 0 && totalDeals > 0 {
		fmt.Println("\n⚠️  You have deals but none are approved!")
		fmt.Println("💡 To approve deals:")
		fmt.Println("   1. Login as admin (admin@snapadeal.com / admin123)")
		fmt.Println("   2. Go to admin panel and approve pending deals")
		fmt.Println("   3. Or use the API: PUT /api/v1/admin/deals/{id}/approve")
	}

	if totalDeals == 0 {
		fmt.Println("\n📝 No deals found in database!")
		fmt.Println("💡 To create test deals:")
		fmt.Println("   1. Register as a merchant")
		fmt.Println("   2. Create some deals")
		fmt.Println("   3. Login as admin and approve them")
	}
}
