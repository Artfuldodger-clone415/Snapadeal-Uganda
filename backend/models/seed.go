package models

import (
	"log"
	"snapadeal/config"
)

func SeedDatabase() {
	// Create categories if they don't exist
	var count int64
	config.DB.Model(&Category{}).Count(&count)
	
	if count == 0 {
		log.Println("Seeding categories...")
		categories := []Category{
			{Name: "Restaurants & Food", Description: "Dining, takeout, and food delivery deals", IconURL: "🍽️", IsActive: true},
			{Name: "Beauty & Spa", Description: "Beauty treatments, spa services, and wellness", IconURL: "💅", IsActive: true},
			{Name: "Fitness & Health", Description: "Gym memberships, fitness classes, and health services", IconURL: "💪", IsActive: true},
			{Name: "Entertainment", Description: "Movies, events, concerts, and fun activities", IconURL: "🎬", IsActive: true},
			{Name: "Travel & Tourism", Description: "Hotels, tours, and travel experiences", IconURL: "✈️", IsActive: true},
			{Name: "Shopping & Retail", Description: "Clothing, electronics, and retail deals", IconURL: "🛍️", IsActive: true},
			{Name: "Services", Description: "Professional services, repairs, and consultations", IconURL: "🔧", IsActive: true},
			{Name: "Education & Training", Description: "Courses, workshops, and educational programs", IconURL: "📚", IsActive: true},
		}
		
		for _, category := range categories {
			config.DB.Create(&category)
		}
		log.Println("Categories seeded successfully")
	}
}
