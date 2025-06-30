"use client"
import type React from "react"
import { useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { useAuth } from "../contexts/AuthContext"
import toast from "react-hot-toast"
import { Eye, EyeOff, Mail, Lock, ArrowRight, Shield, Users } from "lucide-react"

const Login: React.FC = () => {
  const [formData, setFormData] = useState({
    emailOrPhone: "",
    password: "",
  })
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
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
      toast.success("Welcome back!")
      navigate("/")
    } catch (error: any) {
      if (error.message === "PENDING_VERIFICATION") {
        toast.error("Please verify your email address first")
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
    <div className="auth-page">
      <div className="auth-container">
        {/* Left Side - Branding */}
        <div className="auth-branding">
          <div className="auth-branding-content">
            <div className="brand-logo">
              <div className="logo-icon">🛍️</div>
              <h1>Snapadeal</h1>
            </div>
            <h2>Welcome Back!</h2>
            <p>Sign in to discover amazing deals and save money on your favorite activities in Uganda.</p>

            <div className="auth-features">
              <div className="auth-feature">
                <Shield className="feature-icon" />
                <span>Secure & Protected</span>
              </div>
              <div className="auth-feature">
                <Users className="feature-icon" />
                <span>10,000+ Happy Customers</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side - Form */}
        <div className="auth-form-section">
          <div className="auth-form-container">
            <div className="auth-form-header">
              <h3>Sign In</h3>
              <p>Enter your credentials to access your account</p>
            </div>

            <form onSubmit={handleSubmit} className="auth-form">
              <div className="form-group">
                <label className="form-label">Email or Phone Number</label>
                <div className="input-with-icon">
                  <Mail className="input-icon" />
                  <input
                    type="text"
                    name="emailOrPhone"
                    value={formData.emailOrPhone}
                    onChange={handleChange}
                    className="form-control"
                    placeholder="Enter your email or phone number"
                    required
                  />
                </div>
                <small className="form-help">You can use either your email address or phone number</small>
              </div>

              <div className="form-group">
                <label className="form-label">Password</label>
                <div className="input-with-icon">
                  <Lock className="input-icon" />
                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    className="form-control"
                    placeholder="Enter your password"
                    required
                  />
                  <button type="button" className="password-toggle" onClick={() => setShowPassword(!showPassword)}>
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              <div className="form-actions">
                <Link to="/forgot-password" className="forgot-password-link">
                  Forgot your password?
                </Link>
              </div>

              <button type="submit" className="btn-auth-primary" disabled={loading}>
                {loading ? (
                  <div className="btn-loading">
                    <div className="spinner-small"></div>
                    <span>Signing In...</span>
                  </div>
                ) : (
                  <>
                    <span>Sign In</span>
                    <ArrowRight size={18} />
                  </>
                )}
              </button>
            </form>

            <div className="auth-footer">
              <p>
                Don't have an account?{" "}
                <Link to="/register" className="auth-link">
                  Sign up here
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Login
