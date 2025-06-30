"use client"

import type React from "react"
import { useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { useAuth } from "../contexts/AuthContext"
import { Shield } from "lucide-react"
import toast from "react-hot-toast"

const Register: React.FC = () => {
  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
  })
  const [loading, setLoading] = useState(false)
  const { register } = useAuth()
  const navigate = useNavigate()

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
      const result = await register({
        first_name: formData.first_name,
        last_name: formData.last_name,
        email: formData.email,
        phone: formData.phone,
        password: formData.password,
        role: "admin",
      })

      toast.success("Admin registration successful! Please check your email for verification code.")
      // Redirect to OTP verification page
      navigate(`/verify-otp?email=${encodeURIComponent(result.email)}`)
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
        padding: "2rem 0",
      }}
    >
      <div className="card" style={{ width: "100%", maxWidth: "500px", margin: "2rem" }}>
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
          <h2>Admin Registration</h2>
          <p>Create a new administrator account</p>
        </div>
        <div className="card-body">
          <form onSubmit={handleSubmit}>
            <div className="row">
              <div className="col-6">
                <div className="form-group">
                  <label className="form-label">First Name</label>
                  <input
                    type="text"
                    name="first_name"
                    value={formData.first_name}
                    onChange={handleChange}
                    className="form-control"
                    required
                  />
                </div>
              </div>
              <div className="col-6">
                <div className="form-group">
                  <label className="form-label">Last Name</label>
                  <input
                    type="text"
                    name="last_name"
                    value={formData.last_name}
                    onChange={handleChange}
                    className="form-control"
                    required
                  />
                </div>
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Email Address</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="form-control"
                required
              />
              <small className="form-help">We'll send a verification code to this email</small>
            </div>

            <div className="form-group">
              <label className="form-label">Phone Number</label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                className="form-control"
                placeholder="+256700000000"
                required
              />
            </div>

            <div className="row">
              <div className="col-6">
                <div className="form-group">
                  <label className="form-label">Password</label>
                  <input
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    className="form-control"
                    minLength={6}
                    required
                  />
                </div>
              </div>
              <div className="col-6">
                <div className="form-group">
                  <label className="form-label">Confirm Password</label>
                  <input
                    type="password"
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    className="form-control"
                    required
                  />
                </div>
              </div>
            </div>

            <div className="form-group">
              <div
                style={{
                  padding: "1rem",
                  backgroundColor: "#f8f9fa",
                  borderRadius: "8px",
                  border: "1px solid #e9ecef",
                  marginBottom: "1rem",
                }}
              >
                <h4 style={{ margin: "0 0 0.5rem 0", color: "var(--admin-primary)" }}>Administrator Privileges</h4>
                <ul style={{ margin: 0, paddingLeft: "1.2rem", fontSize: "0.9rem" }}>
                  <li>Manage all users (customers and merchants)</li>
                  <li>Approve or reject merchant deals</li>
                  <li>View platform analytics and statistics</li>
                  <li>Access admin dashboard and reports</li>
                  <li>Manage platform settings and configurations</li>
                </ul>
              </div>
            </div>

            <div className="form-group">
              <label style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                <input type="checkbox" required />
                <span style={{ fontSize: "0.9rem" }}>
                  I understand the responsibilities of an administrator and agree to the{" "}
                  <Link to="/terms" style={{ color: "var(--admin-primary)" }}>
                    Terms of Service
                  </Link>
                </span>
              </label>
            </div>

            <button type="submit" className="btn btn-primary" style={{ width: "100%" }} disabled={loading}>
              {loading ? "Creating Admin Account..." : "Create Administrator Account"}
            </button>
          </form>
        </div>
        <div className="card-footer text-center">
          <p>
            Already have an admin account?{" "}
            <Link to="/login" style={{ color: "var(--admin-primary)", fontWeight: "600" }}>
              Sign in here
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}

export default Register
