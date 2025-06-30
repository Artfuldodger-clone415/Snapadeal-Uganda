package handlers

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"snapadeal/config"
	"snapadeal/models"
)

func GetCategories(c *gin.Context) {
	// Explicit CORS headers for this endpoint
	c.Header("Access-Control-Allow-Origin", "*")
	c.Header("Access-Control-Allow-Methods", "GET, OPTIONS")
	c.Header("Access-Control-Allow-Headers", "Origin, Content-Type, Accept, Authorization, X-Requested-With")

	var categories []models.Category
	
	// Fetch active categories with better error handling
	if err := config.DB.Where("is_active = ?", true).Order("name ASC").Find(&categories).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": "Failed to fetch categories",
			"message": "Database error occurred",
			"categories": []models.Category{},
		})
		return
	}

	// Return categories with additional metadata
	c.JSON(http.StatusOK, gin.H{
		"categories": categories,
		"count": len(categories),
		"message": "Categories fetched successfully",
	})
}
