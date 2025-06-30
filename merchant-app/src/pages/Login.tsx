"use client"

import type React from "react"
import { useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { useAuth } from "../contexts/AuthContext"
import toast from "react-hot-toast"

const Login: React.FC = () => {
  const [formData, setFormData] = useState({
    emailOrPhone: "",
    password: "",
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
      toast.success("Welcome back to your merchant dashboard!")
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
        background: "linear-gradient(135deg, var(--primary-green) 0%, var(--secondary-blue) 100%)",
      }}
    >
      <div className="card" style={{ width: "100%", maxWidth: "400px", margin: "2rem" }}>
        <div className="card-header text-center">
          <h1 style={{ color: "var(--primary-green)", marginBottom: "0.5rem" }}>Snapadeal</h1>
          <h2>Merchant Portal</h2>
          <p>Sign in to manage your deals</p>
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
              {loading ? "Signing In..." : "Sign In"}
            </button>
          </form>

          <div className="text-center mt-3">
            <Link to="/forgot-password" style={{ color: "var(--primary-green)" }}>
              Forgot your password?
            </Link>
          </div>
        </div>
        <div className="card-footer text-center">
          <p>
            Don't have a merchant account?{" "}
            <Link to="/register" style={{ color: "var(--primary-green)", fontWeight: "600" }}>
              Apply here
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}

export default Login
