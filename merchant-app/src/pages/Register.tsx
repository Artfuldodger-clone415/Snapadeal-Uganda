"use client"

import type React from "react"
import { useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { useAuth } from "../contexts/AuthContext"
import toast from "react-hot-toast"

const Register: React.FC = () => {
  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
    business_name: "",
    business_type: "",
  })
  const [loading, setLoading] = useState(false)
  const { register } = useAuth()
  const navigate = useNavigate()

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
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
        role: "merchant",
      })

      toast.success("Registration successful! Please check your email for verification code.")

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
        background: "linear-gradient(135deg, var(--primary-green) 0%, var(--secondary-blue) 100%)",
        padding: "2rem 0",
      }}
    >
      <div className="card" style={{ width: "100%", maxWidth: "600px", margin: "2rem" }}>
        <div className="card-header text-center">
          <h1 style={{ color: "var(--primary-green)", marginBottom: "0.5rem" }}>Snapadeal</h1>
          <h2>Become a Merchant</h2>
          <p>Join Uganda's premier deals platform</p>
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
              <label className="form-label">Business Name</label>
              <input
                type="text"
                name="business_name"
                value={formData.business_name}
                onChange={handleChange}
                className="form-control"
                placeholder="Your business or company name"
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Business Type</label>
              <select
                name="business_type"
                value={formData.business_type}
                onChange={handleChange}
                className="form-control"
                required
              >
                <option value="">Select business type</option>
                <option value="restaurant">Restaurant</option>
                <option value="beauty">Beauty & Spa</option>
                <option value="fitness">Fitness & Health</option>
                <option value="entertainment">Entertainment</option>
                <option value="retail">Retail</option>
                <option value="services">Services</option>
                <option value="travel">Travel & Tourism</option>
                <option value="other">Other</option>
              </select>
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
              <label style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                <input type="checkbox" required />
                <span style={{ fontSize: "0.9rem" }}>
                  I agree to the{" "}
                  <Link to="/terms" style={{ color: "var(--primary-green)" }}>
                    Terms of Service
                  </Link>{" "}
                  and{" "}
                  <Link to="/privacy" style={{ color: "var(--primary-green)" }}>
                    Privacy Policy
                  </Link>
                </span>
              </label>
            </div>

            <button type="submit" className="btn btn-primary" style={{ width: "100%" }} disabled={loading}>
              {loading ? "Creating Account..." : "Create Merchant Account"}
            </button>
          </form>
        </div>
        <div className="card-footer text-center">
          <p>
            Already have an account?{" "}
            <Link to="/login" style={{ color: "var(--primary-green)", fontWeight: "600" }}>
              Sign in here
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}

export default Register
