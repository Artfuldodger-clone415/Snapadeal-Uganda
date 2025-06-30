package models

import (
	"database/sql/driver"
	"encoding/json"
	"errors"
	"time"

	"gorm.io/gorm"
)

// StringArray is a custom type to handle JSON arrays in SQLite
type StringArray []string

// Scan implements the Scanner interface for database reads
func (sa *StringArray) Scan(value interface{}) error {
	if value == nil {
		*sa = StringArray{}
		return nil
	}

	switch v := value.(type) {
	case []byte:
		return json.Unmarshal(v, sa)
	case string:
		return json.Unmarshal([]byte(v), sa)
	default:
		return errors.New("cannot scan into StringArray")
	}
}

// Value implements the Valuer interface for database writes
func (sa StringArray) Value() (driver.Value, error) {
	if len(sa) == 0 {
		return "[]", nil
	}
	return json.Marshal(sa)
}

type Deal struct {
	ID              uint        `json:"id" gorm:"primaryKey"`
	Title           string      `json:"title" gorm:"not null"`
	Description     string      `json:"description" gorm:"type:text"`
	ShortDescription string     `json:"short_description"`
	OriginalPrice   float64     `json:"original_price" gorm:"not null"`
	DiscountPrice   float64     `json:"discount_price" gorm:"not null"`
	DiscountPercent int         `json:"discount_percent"`
	ImageURL        string      `json:"image_url"`
	Images          StringArray `json:"images" gorm:"type:text"` // Changed to StringArray
	CategoryID      uint        `json:"category_id"`
	Category        Category    `json:"category" gorm:"foreignKey:CategoryID"`
	MerchantID      uint        `json:"merchant_id"`
	Merchant        User        `json:"merchant" gorm:"foreignKey:MerchantID"`
	Status          string      `json:"status" gorm:"default:'pending'"` // pending, approved, rejected, expired
	StartDate       time.Time   `json:"start_date"`
	EndDate         time.Time   `json:"end_date"`
	MaxQuantity     int         `json:"max_quantity" gorm:"default:100"`
	SoldQuantity    int         `json:"sold_quantity" gorm:"default:0"`
	Location        string      `json:"location"`
	FinePrints      string      `json:"fine_prints" gorm:"type:text"` // Changed from Terms to FinePrints
	IsActive        bool        `json:"is_active" gorm:"default:true"`
	CreatedAt       time.Time   `json:"created_at"`
	UpdatedAt       time.Time   `json:"updated_at"`
	DeletedAt       gorm.DeletedAt `json:"-" gorm:"index"`
}

func (d *Deal) BeforeCreate(tx *gorm.DB) error {
	if d.DiscountPercent == 0 && d.OriginalPrice > 0 {
		d.DiscountPercent = int(((d.OriginalPrice - d.DiscountPrice) / d.OriginalPrice) * 100)
	}
	
	// Validate maximum 10 images
	if len(d.Images) > 10 {
		return errors.New("maximum 10 images allowed per deal")
	}
	
	return nil
}

func (d *Deal) BeforeUpdate(tx *gorm.DB) error {
	// Validate maximum 10 images on update
	if len(d.Images) > 10 {
		return errors.New("maximum 10 images allowed per deal")
	}
	return nil
}

func (d *Deal) IsExpired() bool {
	return time.Now().After(d.EndDate)
}

func (d *Deal) IsAvailable() bool {
	return d.Status == "approved" && d.IsActive && !d.IsExpired() && d.SoldQuantity < d.MaxQuantity
}
