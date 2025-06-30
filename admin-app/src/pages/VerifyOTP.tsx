"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useNavigate, useSearchParams } from "react-router-dom"
import { useAuth } from "../contexts/AuthContext"
import { Shield } from "lucide-react"
import toast from "react-hot-toast"

const VerifyOTP: React.FC = () => {
  const [otp, setOtp] = useState("")
  const [loading, setLoading] = useState(false)
  const [resendLoading, setResendLoading] = useState(false)
  const [resendTimer, setResendTimer] = useState(0)
  const [searchParams] = useSearchParams()
  const { verifyOTP, resendOTP } = useAuth()
  const navigate = useNavigate()

  const email = searchParams.get("email") || ""

  useEffect(() => {
    if (!email) {
      toast.error("Email not provided")
      navigate("/register")
      return
    }

    // Start 60-second timer for resend button
    setResendTimer(60)
    const timer = setInterval(() => {
      setResendTimer((prev) => {
        if (prev <= 1) {
          clearInterval(timer)
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [email, navigate])

  const handleOTPChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, "").slice(0, 6)
    setOtp(value)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (otp.length !== 6) {
      toast.error("Please enter a 6-digit OTP")
      return
    }

    setLoading(true)

    try {
      await verifyOTP(email, otp)
      toast.success("Admin account verified successfully! Welcome to Snapadeal Admin Portal!")
      navigate("/")
    } catch (error: any) {
      toast.error(error.message)
    } finally {
      setLoading(false)
    }
  }

  const handleResendOTP = async () => {
    setResendLoading(true)

    try {
      await resendOTP(email)
      toast.success("OTP has been resent to your email")

      // Restart timer
      setResendTimer(60)
      const timer = setInterval(() => {
        setResendTimer((prev) => {
          if (prev <= 1) {
            clearInterval(timer)
            return 0
          }
          return prev - 1
        })
      }, 1000)
    } catch (error: any) {
      toast.error(error.message)
    } finally {
      setResendLoading(false)
    }
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
      }}
    >
      <div className="card" style={{ width: "100%", maxWidth: "400px", margin: "2rem" }}>
        <div className="card-header text-center">
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              marginBottom: "1rem",
            }}
          >
            <Shield size={32} style={{ marginRight: "0.5rem", color: "var(--admin-primary)" }} />
            <h1 style={{ color: "var(--admin-primary)", margin: 0 }}>Snapadeal</h1>
          </div>
          <h2>Verify Your Email</h2>
          <p>We've sent a 6-digit code to</p>
          <strong style={{ color: "var(--admin-primary)" }}>{email}</strong>
        </div>
        <div className="card-body">
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label">Enter Verification Code</label>
              <input
                type="text"
                value={otp}
                onChange={handleOTPChange}
                className="form-control"
                placeholder="000000"
                style={{
                  textAlign: "center",
                  fontSize: "1.5rem",
                  letterSpacing: "0.5rem",
                  fontWeight: "bold",
                }}
                maxLength={6}
                required
              />
              <small className="form-help">Enter the 6-digit code from your email</small>
            </div>

            <button
              type="submit"
              className="btn btn-primary"
              style={{ width: "100%" }}
              disabled={loading || otp.length !== 6}
            >
              {loading ? "Verifying..." : "Verify Admin Account"}
            </button>
          </form>

          <div className="text-center mt-3">
            <p style={{ color: "var(--text-medium)", fontSize: "14px" }}>Didn't receive the code?</p>
            <button
              onClick={handleResendOTP}
              disabled={resendLoading || resendTimer > 0}
              className="btn btn-outline"
              style={{ marginTop: "0.5rem" }}
            >
              {resendLoading ? "Sending..." : resendTimer > 0 ? `Resend in ${resendTimer}s` : "Resend Code"}
            </button>
          </div>
        </div>
        <div className="card-footer text-center">
          <p>
            Wrong email?{" "}
            <button
              onClick={() => navigate("/register")}
              style={{
                background: "none",
                border: "none",
                color: "var(--admin-primary)",
                fontWeight: "600",
                cursor: "pointer",
              }}
            >
              Go back to registration
            </button>
          </p>
        </div>
      </div>
    </div>
  )
}

export default VerifyOTP
