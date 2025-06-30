package handlers

import (
	"fmt"
	"io"
	"net/http"
	"os"
	"path/filepath"
	"strings"
	"time"

	"github.com/gin-gonic/gin"
)

func UploadImage(c *gin.Context) {
	// Parse multipart form
	err := c.Request.ParseMultipartForm(10 << 20) // 10 MB max
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "File too large"})
		return
	}

	file, header, err := c.Request.FormFile("image")
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "No file uploaded"})
		return
	}
	defer file.Close()

	// Validate file type
	allowedTypes := map[string]bool{
		".jpg":  true,
		".jpeg": true,
		".png":  true,
		".gif":  true,
		".webp": true,
	}

	ext := strings.ToLower(filepath.Ext(header.Filename))
	if !allowedTypes[ext] {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid file type. Only JPG, PNG, GIF, and WebP are allowed"})
		return
	}

	// Create uploads directory if it doesn't exist
	uploadDir := "uploads/images"
	if err := os.MkdirAll(uploadDir, 0755); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create upload directory"})
		return
	}

	// Generate unique filename
	timestamp := time.Now().Unix()
	filename := fmt.Sprintf("%d_%s", timestamp, header.Filename)
	filepath := filepath.Join(uploadDir, filename)

	// Create the file
	dst, err := os.Create(filepath)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create file"})
		return
	}
	defer dst.Close()

	// Copy file content
	if _, err := io.Copy(dst, file); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to save file"})
		return
	}

	// Return the file URL
	fileURL := fmt.Sprintf("/uploads/images/%s", filename)
	c.JSON(http.StatusOK, gin.H{
		"message": "File uploaded successfully",
		"url":     fileURL,
		"filename": filename,
	})
}

func UploadMultipleImages(c *gin.Context) {
	// Parse multipart form
	err := c.Request.ParseMultipartForm(50 << 20) // 50 MB max for multiple files
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Files too large"})
		return
	}

	form := c.Request.MultipartForm
	files := form.File["images"]

	if len(files) == 0 {
		c.JSON(http.StatusBadRequest, gin.H{"error": "No files uploaded"})
		return
	}

	if len(files) > 10 {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Maximum 10 images allowed"})
		return
	}

	// Create uploads directory if it doesn't exist
	uploadDir := "uploads/images"
	if err := os.MkdirAll(uploadDir, 0755); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create upload directory"})
		return
	}

	var uploadedFiles []map[string]string
	allowedTypes := map[string]bool{
		".jpg":  true,
		".jpeg": true,
		".png":  true,
		".gif":  true,
		".webp": true,
	}

	for _, fileHeader := range files {
		// Validate file type
		ext := strings.ToLower(filepath.Ext(fileHeader.Filename))
		if !allowedTypes[ext] {
			c.JSON(http.StatusBadRequest, gin.H{"error": fmt.Sprintf("Invalid file type for %s. Only JPG, PNG, GIF, and WebP are allowed", fileHeader.Filename)})
			return
		}

		// Open uploaded file
		file, err := fileHeader.Open()
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to open file"})
			return
		}
		defer file.Close()

		// Generate unique filename
		timestamp := time.Now().UnixNano()
		filename := fmt.Sprintf("%d_%s", timestamp, fileHeader.Filename)
		filepath := filepath.Join(uploadDir, filename)

		// Create the file
		dst, err := os.Create(filepath)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create file"})
			return
		}
		defer dst.Close()

		// Copy file content
		if _, err := io.Copy(dst, file); err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to save file"})
			return
		}

		uploadedFiles = append(uploadedFiles, map[string]string{
			"url":      fmt.Sprintf("/uploads/images/%s", filename),
			"filename": filename,
		})
	}

	c.JSON(http.StatusOK, gin.H{
		"message": "Files uploaded successfully",
		"files":   uploadedFiles,
	})
}
