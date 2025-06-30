"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Link, useNavigate, useSearchParams } from "react-router-dom"
import { useAuth } from "../contexts/AuthContext"
import { Shield } from "lucide-react"
import toast from "react-hot-toast"

const ResetPassword: React.FC = () => {
  const [formData, setFormData] = useState({
    password: "",
    confirmPassword: "",
  })
  const [loading, setLoading] = useState(false)
  const [searchParams] = useSearchParams()
  const { resetPassword } = useAuth()
  const navigate = useNavigate()

  const token = searchParams.get("token") || ""

  useEffect(() => {
    if (!token) {
      toast.error("Invalid reset link")
      navigate("/forgot-password")
    }
  }, [token, navigate])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (formData.password !== formData.confirmPassword) {
      toast.error("Passwords do not match")
      return
    }

    if (formData.password.length < 6) {
      toast.error("Password must be at least 6 characters")
      return
    }

    setLoading(true)

    try {
      await resetPassword(token, formData.password)
      toast.success("Password reset successful!")
      navigate("/login")
    } catch (error: any) {
      toast.error(error.message)
    } finally {
      setLoading(false)
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
          <h2>Set New Password</h2>
          <p>Enter your new password below</p>
        </div>
        <div className="card-body">
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label">New Password</label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                className="form-control"
                minLength={6}
                required
              />
              <small className="form-help">Password must be at least 6 characters</small>
            </div>
            <div className="form-group">
              <label className="form-label">Confirm New Password</label>
              <input
                type="password"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                className="form-control"
                required
              />
            </div>
            <button type="submit" className="btn btn-primary" style={{ width: "100%" }} disabled={loading}>
              {loading ? "Updating..." : "Update Password"}
            </button>
          </form>
        </div>
        <div className="card-footer text-center">
          <p>
            Remember your password?{" "}
            <Link to="/login" style={{ color: "var(--admin-primary)", fontWeight: "600" }}>
              Sign in here
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}

export default ResetPassword
