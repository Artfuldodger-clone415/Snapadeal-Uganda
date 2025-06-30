package services

import (
	"fmt"
	"net/smtp"
	"os"
	"strings"
)

type EmailService struct {
	Host     string
	Port     string
	Username string
	Password string
	From     string
	FromName string
}

func NewEmailService() *EmailService {
	return &EmailService{
		Host:     os.Getenv("SMTP_HOST"),
		Port:     os.Getenv("SMTP_PORT"),
		Username: os.Getenv("SMTP_USER"),
		Password: os.Getenv("SMTP_PASS"),
		From:     os.Getenv("SMTP_USER"),
		FromName: os.Getenv("SMTP_FROM_NAME"),
	}
}

func (e *EmailService) SendEmail(to, subject, body string) error {
	if e.Host == "" || e.Username == "" || e.Password == "" {
		fmt.Println("⚠️ Email service not configured - skipping email send")
		return nil // Don't fail if email is not configured
	}

	auth := smtp.PlainAuth("", e.Username, e.Password, e.Host)

	fromName := e.FromName
	if fromName == "" {
		fromName = "Snapadeal Uganda"
	}

	msg := []string{
		fmt.Sprintf("From: %s <%s>", fromName, e.From),
		fmt.Sprintf("To: %s", to),
		fmt.Sprintf("Subject: %s", subject),
		"MIME-Version: 1.0",
		"Content-Type: text/html; charset=UTF-8",
		"",
		body,
	}

	return smtp.SendMail(
		e.Host+":"+e.Port,
		auth,
		e.From,
		[]string{to},
		[]byte(strings.Join(msg, "\r\n")),
	)
}

func (e *EmailService) SendOTPEmail(to, name, otp string) error {
	subject := "Verify Your Snapadeal Account"
	body := fmt.Sprintf(`
<!DOCTYPE html>
<html>
<head>
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #00b894 0%%, #0984e3 100%%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
        .content { background: #f8f9fa; padding: 30px; border-radius: 0 0 10px 10px; }
        .otp-code { background: #fff; border: 2px solid #00b894; padding: 20px; text-align: center; font-size: 32px; font-weight: bold; color: #00b894; margin: 20px 0; border-radius: 8px; letter-spacing: 5px; }
        .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
        .btn { background: #00b894; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block; margin: 10px 0; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🎉 Welcome to Snapadeal!</h1>
            <p>Verify your account to start saving</p>
        </div>
        <div class="content">
            <h2>Hi %s,</h2>
            <p>Thank you for joining Snapadeal Uganda! To complete your registration, please verify your email address using the OTP code below:</p>
            
            <div class="otp-code">%s</div>
            
            <p><strong>This code will expire in 10 minutes.</strong></p>
            
            <p>If you didn't create an account with Snapadeal, please ignore this email.</p>
            
            <p>Best regards,<br>The Snapadeal Team</p>
        </div>
        <div class="footer">
            <p>© 2025 Snapadeal Uganda. All rights reserved.</p>
            <p>This is an automated email. Please do not reply.</p>
        </div>
    </div>
</body>
</html>`, name, otp)

	return e.SendEmail(to, subject, body)
}

func (e *EmailService) SendPasswordResetEmail(to, name, resetURL string) error {
	subject := "Reset Your Snapadeal Password"
	body := fmt.Sprintf(`
<!DOCTYPE html>
<html>
<head>
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #00b894 0%%, #0984e3 100%%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
        .content { background: #f8f9fa; padding: 30px; border-radius: 0 0 10px 10px; }
        .btn { background: #00b894; color: white; padding: 15px 30px; text-decoration: none; border-radius: 6px; display: inline-block; margin: 20px 0; font-weight: bold; }
        .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
        .warning { background: #fff3cd; border: 1px solid #ffeaa7; padding: 15px; border-radius: 6px; margin: 20px 0; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🔐 Password Reset Request</h1>
            <p>Snapadeal Account Recovery</p>
        </div>
        <div class="content">
            <h2>Hi %s,</h2>
            <p>We received a request to reset your Snapadeal account password. Click the button below to create a new password:</p>
            
            <div style="text-align: center;">
                <a href="%s" class="btn">Reset My Password</a>
            </div>
            
            <div class="warning">
                <strong>⚠️ Security Notice:</strong>
                <ul>
                    <li>This link will expire in 1 hour</li>
                    <li>If you didn't request this reset, please ignore this email</li>
                    <li>Never share this link with anyone</li>
                </ul>
            </div>
            
            <p>If the button doesn't work, copy and paste this link into your browser:</p>
            <p style="word-break: break-all; color: #666; font-size: 12px;">%s</p>
            
            <p>Best regards,<br>The Snapadeal Team</p>
        </div>
        <div class="footer">
            <p>© 2025 Snapadeal Uganda. All rights reserved.</p>
            <p>This is an automated email. Please do not reply.</p>
        </div>
    </div>
</body>
</html>`, name, resetURL, resetURL)

	return e.SendEmail(to, subject, body)
}

func (e *EmailService) SendWelcomeEmail(to, name, role string) error {
	subject := "Welcome to Snapadeal Uganda! 🎉"
	
	roleMessage := "start discovering amazing deals"
	if role == "merchant" {
		roleMessage = "start creating and managing your deals"
	} else if role == "admin" {
		roleMessage = "manage the Snapadeal platform"
	}

	body := fmt.Sprintf(`
<!DOCTYPE html>
<html>
<head>
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #00b894 0%%, #0984e3 100%%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
        .content { background: #f8f9fa; padding: 30px; border-radius: 0 0 10px 10px; }
        .feature { background: white; padding: 15px; margin: 10px 0; border-radius: 6px; border-left: 4px solid #00b894; }
        .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
        .btn { background: #00b894; color: white; padding: 15px 30px; text-decoration: none; border-radius: 6px; display: inline-block; margin: 20px 0; font-weight: bold; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🎉 Welcome to Snapadeal!</h1>
            <p>Your account has been verified successfully</p>
        </div>
        <div class="content">
            <h2>Hi %s,</h2>
            <p>Congratulations! Your Snapadeal account has been verified and you can now %s.</p>
            
            <div class="feature">
                <h3>🛍️ What's Next?</h3>
                <p>Explore thousands of amazing deals from local businesses across Uganda and save up to 90%% on your favorite activities!</p>
            </div>
            
            <div style="text-align: center;">
                <a href="http://localhost:3000" class="btn">Start Exploring Deals</a>
            </div>
            
            <p>If you have any questions, feel free to contact our support team.</p>
            
            <p>Happy saving!<br>The Snapadeal Team</p>
        </div>
        <div class="footer">
            <p>© 2025 Snapadeal Uganda. All rights reserved.</p>
        </div>
    </div>
</body>
</html>`, name, roleMessage)

	return e.SendEmail(to, subject, body)
}
