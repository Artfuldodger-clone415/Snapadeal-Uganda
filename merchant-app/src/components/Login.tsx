"use client"

import type React from "react"
import { useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { useAuth } from "../contexts/AuthContext"
import toast from "react-hot-toast"

const Login: React.FC = () => {
  const [formData, setFormData] = useState({
    email: "",
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
      await login(formData.email, formData.password)
      toast.success("Login successful!")
      navigate("/")
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
              <label className="form-label">Email Address</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="form-control"
                required
              />
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
