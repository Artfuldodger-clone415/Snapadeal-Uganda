"use client"

import type React from "react"
import { useState } from "react"
import { useAuth } from "../contexts/AuthContext"
import { api } from "../services/api"
import toast from "react-hot-toast"

const Profile: React.FC = () => {
  const { user, logout } = useAuth()
  const [editing, setEditing] = useState(false)
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    first_name: user?.first_name || "",
    last_name: user?.last_name || "",
    phone: user?.phone || "",
  })

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
      await api.put("/users/profile", formData)
      toast.success("Profile updated successfully")
      setEditing(false)
      window.location.reload()
    } catch (error: any) {
      toast.error(error.response?.data?.error || "Failed to update profile")
    } finally {
      setLoading(false)
    }
  }

  const handleCancel = () => {
    setFormData({
      first_name: user?.first_name || "",
      last_name: user?.last_name || "",
      phone: user?.phone || "",
    })
    setEditing(false)
  }

  if (!user) {
    return <div className="spinner"></div>
  }

  return (
    <div>
      <h1>Merchant Profile</h1>
      <p style={{ color: "var(--text-light)", marginBottom: "2rem" }}>Manage your merchant account information</p>

      <div className="row">
        <div className="col-8">
          <div className="card">
            <div className="card-header">
              <div className="d-flex justify-content-between align-items-center">
                <h4>Personal Information</h4>
                {!editing && (
                  <button onClick={() => setEditing(true)} className="btn btn-outline">
                    Edit Profile
                  </button>
                )}
              </div>
            </div>

            <div className="card-body">
              {editing ? (
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
                    <label className="form-label">Phone Number</label>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      className="form-control"
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Email Address</label>
                    <input
                      type="email"
                      value={user.email}
                      className="form-control"
                      disabled
                      style={{ backgroundColor: "#f8f9fa" }}
                    />
                    <small style={{ color: "#666" }}>Email cannot be changed</small>
                  </div>

                  <div className="d-flex gap-2">
                    <button type="submit" className="btn btn-primary" disabled={loading}>
                      {loading ? "Saving..." : "Save Changes"}
                    </button>
                    <button type="button" onClick={handleCancel} className="btn btn-outline">
                      Cancel
                    </button>
                  </div>
                </form>
              ) : (
                <div>
                  <div className="row mb-3">
                    <div className="col-6">
                      <strong>First Name:</strong>
                      <p>{user.first_name}</p>
                    </div>
                    <div className="col-6">
                      <strong>Last Name:</strong>
                      <p>{user.last_name}</p>
                    </div>
                  </div>

                  <div className="mb-3">
                    <strong>Email:</strong>
                    <p>{user.email}</p>
                  </div>

                  <div className="mb-3">
                    <strong>Phone:</strong>
                    <p>{user.phone}</p>
                  </div>

                  <div className="mb-3">
                    <strong>Account Type:</strong>
                    <p>
                      <span
                        style={{
                          background: "var(--primary-green)",
                          color: "white",
                          padding: "4px 12px",
                          borderRadius: "20px",
                          fontSize: "0.8rem",
                          fontWeight: "600",
                        }}
                      >
                        MERCHANT
                      </span>
                    </p>
                  </div>

                  <div className="mb-3">
                    <strong>Account Status:</strong>
                    <p>
                      <span
                        style={{
                          color: user.status === "active" ? "var(--success)" : "var(--error)",
                          fontWeight: "600",
                        }}
                      >
                        {user.status.charAt(0).toUpperCase() + user.status.slice(1)}
                      </span>
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="col-4">
          <div className="card">
            <div className="card-header">
              <h4>Account Actions</h4>
            </div>
            <div className="card-body">
              <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                <button className="btn btn-outline">Change Password</button>
                <button className="btn btn-outline">Download Data</button>
                <button className="btn btn-outline">Account Settings</button>
                <hr />
                <button onClick={logout} className="btn btn-danger">
                  Logout
                </button>
              </div>
            </div>
          </div>

          <div className="card">
            <div className="card-header">
              <h4>Support</h4>
            </div>
            <div className="card-body">
              <p style={{ fontSize: "0.9rem", marginBottom: "1rem" }}>Need help with your merchant account?</p>
              <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                <button className="btn btn-outline btn-small">Contact Support</button>
                <button className="btn btn-outline btn-small">Help Center</button>
                <button className="btn btn-outline btn-small">Merchant Guide</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Profile
