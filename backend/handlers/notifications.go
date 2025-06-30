package handlers

import (
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"
	"snapadeal/config"
	"snapadeal/models"
)

func GetNotifications(c *gin.Context) {
	userID := c.GetUint("user_id")
	
	var notifications []models.Notification
	query := config.DB.Where("user_id = ?", userID).Order("created_at DESC")

	// Pagination
	page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
	limit, _ := strconv.Atoi(c.DefaultQuery("limit", "20"))
	offset := (page - 1) * limit

	query = query.Offset(offset).Limit(limit)

	if err := query.Find(&notifications).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch notifications"})
		return
	}

	// Get unread count
	var unreadCount int64
	config.DB.Model(&models.Notification{}).Where("user_id = ? AND is_read = ?", userID, false).Count(&unreadCount)

	c.JSON(http.StatusOK, gin.H{
		"notifications": notifications,
		"unread_count":  unreadCount,
	})
}

func MarkNotificationAsRead(c *gin.Context) {
	userID := c.GetUint("user_id")
	notificationID := c.Param("id")

	var notification models.Notification
	if err := config.DB.Where("id = ? AND user_id = ?", notificationID, userID).First(&notification).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Notification not found"})
		return
	}

	notification.IsRead = true
	if err := config.DB.Save(&notification).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to mark notification as read"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Notification marked as read"})
}

func MarkAllNotificationsAsRead(c *gin.Context) {
	userID := c.GetUint("user_id")

	if err := config.DB.Model(&models.Notification{}).Where("user_id = ?", userID).Update("is_read", true).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to mark notifications as read"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "All notifications marked as read"})
}

func DeleteNotification(c *gin.Context) {
	userID := c.GetUint("user_id")
	notificationID := c.Param("id")

	var notification models.Notification
	if err := config.DB.Where("id = ? AND user_id = ?", notificationID, userID).First(&notification).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Notification not found"})
		return
	}

	if err := config.DB.Delete(&notification).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to delete notification"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Notification deleted successfully"})
}

// Admin-specific notification functions
func BroadcastNotification(c *gin.Context) {
	var req struct {
		Title    string   `json:"title" binding:"required"`
		Message  string   `json:"message" binding:"required"`
		UserRole string   `json:"user_role"` // "all", "merchant", "customer"
		UserIDs  []uint   `json:"user_ids"`  // specific user IDs
	}

	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	var users []models.User
	query := config.DB.Select("id")

	// Filter users based on request
	if len(req.UserIDs) > 0 {
		query = query.Where("id IN ?", req.UserIDs)
	} else if req.UserRole != "" && req.UserRole != "all" {
		query = query.Where("role = ?", req.UserRole)
	}

	if err := query.Find(&users).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch users"})
		return
	}

	// Create notifications for all selected users
	var notifications []models.Notification
	for _, user := range users {
		notifications = append(notifications, models.Notification{
			UserID:  user.ID,
			Title:   req.Title,
			Message: req.Message,
			Type:    models.NotificationSystemUpdate,
		})
	}

	if err := config.DB.Create(&notifications).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to send notifications"})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"message": "Notifications sent successfully",
		"count":   len(notifications),
	})
}

func GetNotificationStats(c *gin.Context) {
	var stats struct {
		TotalNotifications   int64 `json:"total_notifications"`
		UnreadNotifications  int64 `json:"unread_notifications"`
		NotificationsByType  map[string]int64 `json:"notifications_by_type"`
		RecentNotifications  []models.Notification `json:"recent_notifications"`
	}

	// Total notifications
	config.DB.Model(&models.Notification{}).Count(&stats.TotalNotifications)

	// Unread notifications
	config.DB.Model(&models.Notification{}).Where("is_read = ?", false).Count(&stats.UnreadNotifications)

	// Notifications by type
	var typeStats []struct {
		Type  string `json:"type"`
		Count int64  `json:"count"`
	}
	config.DB.Model(&models.Notification{}).
		Select("type, COUNT(*) as count").
		Group("type").
		Find(&typeStats)

	stats.NotificationsByType = make(map[string]int64)
	for _, stat := range typeStats {
		stats.NotificationsByType[stat.Type] = stat.Count
	}

	// Recent notifications (last 10)
	config.DB.Preload("User").
		Order("created_at DESC").
		Limit(10).
		Find(&stats.RecentNotifications)

	c.JSON(http.StatusOK, stats)
}
