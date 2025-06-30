package models

import (
	"crypto/rand"
	"fmt"
	"math/big"
	"time"

	"golang.org/x/crypto/bcrypt"
	"gorm.io/gorm"
	"snapadeal/config"
)

type User struct {
	ID                uint           `json:"id" gorm:"primaryKey"`
	FirstName         string         `json:"first_name" gorm:"not null"`
	LastName          string         `json:"last_name" gorm:"not null"`
	Email             string         `json:"email" gorm:"unique;not null"`
	Phone             string         `json:"phone" gorm:"unique;not null"`
	Password          string         `json:"-" gorm:"not null"`
	Role              string         `json:"role" gorm:"default:'customer'"` // customer, merchant, admin
	Status            string         `json:"status" gorm:"default:'pending'"` // pending, active, inactive, suspended
	IsVerified        bool           `json:"is_verified" gorm:"default:false"`
	EmailVerifiedAt   *time.Time     `json:"email_verified_at"`
	OTPCode           string         `json:"-" gorm:"size:6"`
	OTPExpiresAt      *time.Time     `json:"-"`
	ResetToken        string         `json:"-" gorm:"size:64"`
	ResetTokenExpires *time.Time     `json:"-"`
	LastLoginAt       *time.Time     `json:"last_login_at"`
	CreatedAt         time.Time      `json:"created_at"`
	UpdatedAt         time.Time      `json:"updated_at"`
	DeletedAt         gorm.DeletedAt `json:"-" gorm:"index"`
}

func (u *User) HashPassword() error {
	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(u.Password), bcrypt.DefaultCost)
	if err != nil {
		return err
	}
	u.Password = string(hashedPassword)
	return nil
}

func (u *User) CheckPassword(password string) bool {
	err := bcrypt.CompareHashAndPassword([]byte(u.Password), []byte(password))
	return err == nil
}

// Generate 6-digit OTP
func (u *User) GenerateOTP() error {
	// Generate random 6-digit number
	max := big.NewInt(999999)
	min := big.NewInt(100000)
	
	n, err := rand.Int(rand.Reader, max.Sub(max, min))
	if err != nil {
		return err
	}
	
	otp := n.Add(n, min).String()
	u.OTPCode = otp
	
	// Set expiration to 10 minutes from now
	expiresAt := time.Now().Add(10 * time.Minute)
	u.OTPExpiresAt = &expiresAt
	
	return nil
}

// Verify OTP
func (u *User) VerifyOTP(otp string) bool {
	if u.OTPCode == "" || u.OTPExpiresAt == nil {
		return false
	}
	
	// Check if OTP has expired
	if time.Now().After(*u.OTPExpiresAt) {
		return false
	}
	
	return u.OTPCode == otp
}

// Clear OTP after verification
func (u *User) ClearOTP() {
	u.OTPCode = ""
	u.OTPExpiresAt = nil
}

// Generate password reset token
func (u *User) GenerateResetToken() error {
	// Generate random 32-byte token
	bytes := make([]byte, 32)
	_, err := rand.Read(bytes)
	if err != nil {
		return err
	}
	
	u.ResetToken = fmt.Sprintf("%x", bytes)
	
	// Set expiration to 1 hour from now
	expiresAt := time.Now().Add(1 * time.Hour)
	u.ResetTokenExpires = &expiresAt
	
	return nil
}

// Verify reset token
func (u *User) VerifyResetToken(token string) bool {
	if u.ResetToken == "" || u.ResetTokenExpires == nil {
		return false
	}
	
	// Check if token has expired
	if time.Now().After(*u.ResetTokenExpires) {
		return false
	}
	
	return u.ResetToken == token
}

// Clear reset token after use
func (u *User) ClearResetToken() {
	u.ResetToken = ""
	u.ResetTokenExpires = nil
}

// Update last login time
func (u *User) UpdateLastLogin() {
	now := time.Now()
	u.LastLoginAt = &now
}

func CreateDefaultAdmin() {
	var admin User
	result := config.DB.Where("email = ?", "admin@snapadeal.com").First(&admin)
	
	if result.Error == gorm.ErrRecordNotFound {
		admin = User{
			FirstName:       "Super",
			LastName:        "Admin",
			Email:           "admin@snapadeal.com",
			Phone:           "+256700000000",
			Password:        "admin123",
			Role:            "admin",
			Status:          "active",
			IsVerified:      true,
			EmailVerifiedAt: &time.Time{},
		}
		now := time.Now()
		admin.EmailVerifiedAt = &now
		admin.HashPassword()
		config.DB.Create(&admin)
	}
}
