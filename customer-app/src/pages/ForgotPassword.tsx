"use client"

import type React from "react"
import { useState } from "react"
import { Link } from "react-router-dom"
import { useAuth } from "../contexts/AuthContext"
import toast from "react-hot-toast"

const ForgotPassword: React.FC = () => {
  const [email, setEmail] = useState("")
  const [loading, setLoading] = useState(false)
  const [emailSent, setEmailSent] = useState(false)
  const { forgotPassword } = useAuth()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      await forgotPassword(email)
      setEmailSent(true)
      toast.success("Password reset link sent to your email!")
    } catch (error: any) {
      toast.error(error.message)
    } finally {
      setLoading(false)
    }
  }

  if (emailSent) {
    return (
      <div className="container" style={{ maxWidth: "400px", marginTop: "2rem" }}>
        <div className="card">
          <div className="card-header text-center">
            <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>📧</div>
            <h2>Check Your Email</h2>
            <p>We've sent a password reset link to</p>
            <strong style={{ color: "var(--primary-green)" }}>{email}</strong>
          </div>
          <div className="card-body text-center">
            <p style={{ color: "var(--text-medium)", marginBottom: "2rem" }}>
              Click the link in your email to reset your password. The link will expire in 1 hour.
            </p>

            <div style={{ marginBottom: "1rem" }}>
              <button onClick={() => setEmailSent(false)} className="btn btn-outline">
                Try Different Email
              </button>
            </div>
          </div>
          <div className="card-footer text-center">
            <p>
              Remember your password?{" "}
              <Link to="/login" style={{ color: "var(--primary-green)", fontWeight: "600" }}>
                Sign in here
              </Link>
            </p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="container" style={{ maxWidth: "400px", marginTop: "2rem" }}>
      <div className="card">
        <div className="card-header text-center">
          <h2>Reset Password</h2>
          <p>Enter your email to receive a reset link</p>
        </div>
        <div className="card-body">
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label">Email Address</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="form-control"
                placeholder="Enter your email address"
                required
              />
              <small className="form-help">We'll send a password reset link to this email</small>
            </div>

            <button type="submit" className="btn btn-primary btn-large" style={{ width: "100%" }} disabled={loading}>
              {loading ? "Sending..." : "Send Reset Link"}
            </button>
          </form>
        </div>
        <div className="card-footer text-center">
          <p>
            Remember your password?{" "}
            <Link to="/login" style={{ color: "var(--primary-green)", fontWeight: "600" }}>
              Sign in here
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}

export default ForgotPassword
