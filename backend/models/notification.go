package models

import (
	"time"
	"gorm.io/gorm"
)

type Notification struct {
	ID        uint      `json:"id" gorm:"primaryKey"`
	UserID    uint      `json:"user_id" gorm:"not null"`
	User      User      `json:"user" gorm:"foreignKey:UserID"`
	Title     string    `json:"title" gorm:"not null"`
	Message   string    `json:"message" gorm:"type:text;not null"`
	Type      string    `json:"type" gorm:"not null"` // deal_approved, deal_rejected, deal_purchased, etc.
	IsRead    bool      `json:"is_read" gorm:"default:false"`
	Data      string    `json:"data" gorm:"type:text"` // JSON data for additional info
	CreatedAt time.Time `json:"created_at"`
	UpdatedAt time.Time `json:"updated_at"`
	DeletedAt gorm.DeletedAt `json:"-" gorm:"index"`
}

// Notification types constants
const (
	NotificationDealApproved  = "deal_approved"
	NotificationDealRejected  = "deal_rejected"
	NotificationDealPurchased = "deal_purchased"
	NotificationDealExpiring  = "deal_expiring"
	NotificationSystemUpdate  = "system_update"
)
