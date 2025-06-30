"use client"

import type React from "react"
import { useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { useAuth } from "../contexts/AuthContext"
import { Shield } from "lucide-react"
import toast from "react-hot-toast"

const Login: React.FC = () => {
  const [formData, setFormData] = useState({
    emailOrPhone: "admin@snapadeal.com",
    password: "admin123",
  })
  const [loading, setLoading] = useState(false)
  const { login } = useAuth()
  const navigate = useNavigate()

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      await login(formData.emailOrPhone, formData.password)
      toast.success("Welcome to Snapadeal Admin Portal!")
      navigate("/")
    } catch (error: any) {
      if (error.message === "PENDING_VERIFICATION") {
        toast.error("Please verify your email address first")
        // Redirect to OTP verification with email
        const email = formData.emailOrPhone.includes("@") ? formData.emailOrPhone : ""
        if (email) {
          navigate(`/verify-otp?email=${encodeURIComponent(email)}`)
        } else {
          toast.error("Please use your email address to complete verification")
        }
      } else {
        toast.error(error.message)
      }
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
          <h2>Admin Portal</h2>
          <p>System Administration Dashboard</p>
        </div>
        <div className="card-body">
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label">Email or Phone Number</label>
              <input
                type="text"
                name="emailOrPhone"
                value={formData.emailOrPhone}
                onChange={handleChange}
                className="form-control"
                placeholder="Enter your email or phone number"
                required
              />
              <small className="form-help">You can use either your email address or phone number</small>
            </div>
            <div className="form-group">
              <label className="form-label">Password</label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                className="form-control"
                required
              />
            </div>
            <button type="submit" className="btn btn-primary" style={{ width: "100%" }} disabled={loading}>
              {loading ? "Signing In..." : "Access Admin Portal"}
            </button>
          </form>
          <div className="text-center mt-3">
            <Link to="/forgot-password" style={{ color: "var(--admin-primary)" }}>
              Forgot your password?
            </Link>
          </div>
        </div>
        <div className="card-footer text-center">
          <p>
            Need an admin account?{" "}
            <Link to="/register" style={{ color: "var(--admin-primary)", fontWeight: "600" }}>
              Request access
            </Link>
          </p>
          <div style={{ marginTop: "1rem" }}>
            <small style={{ color: "var(--text-light)" }}>Default: admin@snapadeal.com / admin123</small>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Login
