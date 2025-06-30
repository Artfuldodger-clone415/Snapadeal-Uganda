package config

import (
	"log"
	"os"

	"gorm.io/driver/postgres"
	"gorm.io/driver/sqlite"
	"gorm.io/gorm"
)

var DB *gorm.DB

func ConnectDatabase() {
	var database *gorm.DB
	var err error

	// Check if PostgreSQL URL is provided
	dsn := os.Getenv("DATABASE_URL")
	
	if dsn != "" && dsn != "sqlite" {
		// Try PostgreSQL if DATABASE_URL is provided
		log.Println("Attempting PostgreSQL connection...")
		database, err = gorm.Open(postgres.Open(dsn), &gorm.Config{})
		if err != nil {
			log.Printf("PostgreSQL connection failed: %v", err)
			log.Println("Falling back to SQLite...")
			// Fallback to SQLite
			database, err = gorm.Open(sqlite.Open("snapadeal.db"), &gorm.Config{})
			if err != nil {
				log.Fatal("Failed to connect to SQLite database:", err)
			}
			log.Println("✅ Connected to SQLite database (snapadeal.db)")
		} else {
			log.Println("✅ Connected to PostgreSQL database")
		}
	} else {
		// Use SQLite by default
		log.Println("Using SQLite database...")
		database, err = gorm.Open(sqlite.Open("snapadeal.db"), &gorm.Config{})
		if err != nil {
			log.Fatal("Failed to connect to SQLite database:", err)
		}
		log.Println("✅ Connected to SQLite database (snapadeal.db)")
	}

	DB = database
}
