package main

import (
	"fmt"
	"log"
	"net/http"
	"os"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
)

func testServer() {
	r := gin.Default()

	// Simple CORS
	r.Use(cors.New(cors.Config{
		AllowAllOrigins: true,
		AllowMethods:    []string{"GET", "POST", "PUT", "DELETE", "OPTIONS"},
		AllowHeaders:    []string{"*"},
	}))

	// Test endpoints
	r.GET("/health", func(c *gin.Context) {
		c.JSON(200, gin.H{"status": "ok", "message": "Test server running"})
	})

	r.GET("/api/v1/categories", func(c *gin.Context) {
		c.JSON(200, gin.H{
			"categories": []gin.H{
				{"id": 1, "name": "Food & Dining"},
				{"id": 2, "name": "Shopping"},
				{"id": 3, "name": "Entertainment"},
			},
			"count":   3,
			"message": "Test categories",
		})
	})

	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}

	fmt.Printf("🧪 Test server starting on port %s\n", port)
	fmt.Printf("🌐 Test health: http://localhost:%s/health\n", port)
	fmt.Printf("📂 Test categories: http://localhost:%s/api/v1/categories\n", port)

	log.Fatal(http.ListenAndServe(":"+port, r))
}

func main() {
	testServer()
}
