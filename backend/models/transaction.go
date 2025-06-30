package models

import (
	"time"
	"gorm.io/gorm"
)

type Transaction struct {
	ID               uint      `json:"id" gorm:"primaryKey"`
	UserID           uint      `json:"user_id" gorm:"not null"`
	User             User      `json:"user" gorm:"foreignKey:UserID"`
	DealID           uint      `json:"deal_id" gorm:"not null"`
	Deal             Deal      `json:"deal" gorm:"foreignKey:DealID"`
	Quantity         int       `json:"quantity" gorm:"not null"`
	Amount           float64   `json:"amount" gorm:"not null"`
	PaymentMethod    string    `json:"payment_method" gorm:"not null"` // mtn_money, airtel_money
	PhoneNumber      string    `json:"phone_number" gorm:"not null"`
	PaymentReference string    `json:"payment_reference"`
	Status           string    `json:"status" gorm:"default:'pending'"` // pending, completed, failed
	CreatedAt        time.Time `json:"created_at"`
	UpdatedAt        time.Time `json:"updated_at"`
	DeletedAt        gorm.DeletedAt `json:"-" gorm:"index"`
}

// Transaction status constants
const (
	TransactionStatusPending   = "pending"
	TransactionStatusCompleted = "completed"
	TransactionStatusFailed    = "failed"
)
