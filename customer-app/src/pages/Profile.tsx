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
    return (
      <div className="loading-container">
        <div className="spinner-large"></div>
      </div>
    )
  }

  return (
    <div className="profile-page">
      <div className="container">
        <div className="profile-container">
          {/* Profile Header */}
          <div className="profile-header">
            <div className="profile-avatar">
              <span className="avatar-text">
                {user.first_name?.charAt(0)}
                {user.last_name?.charAt(0)}
              </span>
            </div>
            <div className="profile-info">
              <h1 className="profile-name">
                {user.first_name} {user.last_name}
              </h1>
              <p className="profile-email">{user.email}</p>
              <div className="profile-badges">
                <span className={`status-badge ${user.status === "active" ? "active" : "inactive"}`}>
                  {user.status === "active" ? "✓ Active" : "⚠ Inactive"}
                </span>
                <span className={`verification-badge ${user.is_verified ? "verified" : "unverified"}`}>
                  {user.is_verified ? "✓ Verified" : "⚠ Unverified"}
                </span>
              </div>
            </div>
          </div>

          {/* Profile Content */}
          <div className="profile-content">
            <div className="profile-card">
              <div className="card-header">
                <h2>Personal Information</h2>
                {!editing && (
                  <button onClick={() => setEditing(true)} className="btn btn-outline">
                    Edit Profile
                  </button>
                )}
              </div>

              <div className="card-body">
                {editing ? (
                  <form onSubmit={handleSubmit} className="profile-form">
                    <div className="form-row">
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

                    <div className="form-group">
                      <label className="form-label">Phone Number</label>
                      <input
                        type="tel"
                        name="phone"
                        value={formData.phone}
                        onChange={handleChange}
                        className="form-control"
                        placeholder="+256 700 000 000"
                        required
                      />
                    </div>

                    <div className="form-group">
                      <label className="form-label">Email Address</label>
                      <input type="email" value={user.email} className="form-control disabled" disabled />
                      <small className="form-help">Email cannot be changed</small>
                    </div>

                    <div className="form-actions">
                      <button type="submit" className="btn btn-primary" disabled={loading}>
                        {loading ? "Saving..." : "Save Changes"}
                      </button>
                      <button type="button" onClick={handleCancel} className="btn btn-outline">
                        Cancel
                      </button>
                    </div>
                  </form>
                ) : (
                  <div className="profile-details">
                    <div className="detail-row">
                      <div className="detail-item">
                        <label>First Name</label>
                        <span>{user.first_name}</span>
                      </div>
                      <div className="detail-item">
                        <label>Last Name</label>
                        <span>{user.last_name}</span>
                      </div>
                    </div>

                    <div className="detail-row">
                      <div className="detail-item">
                        <label>Email Address</label>
                        <span>{user.email}</span>
                      </div>
                      <div className="detail-item">
                        <label>Phone Number</label>
                        <span>{user.phone || "Not provided"}</span>
                      </div>
                    </div>

                    <div className="detail-row">
                      <div className="detail-item">
                        <label>Account Status</label>
                        <span className={user.status === "active" ? "text-success" : "text-error"}>
                          {user.status.charAt(0).toUpperCase() + user.status.slice(1)}
                        </span>
                      </div>
                      <div className="detail-item">
                        <label>Verification Status</label>
                        <span className={user.is_verified ? "text-success" : "text-error"}>
                          {user.is_verified ? "Verified" : "Not Verified"}
                        </span>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <div className="card-footer">
                <button onClick={logout} className="btn btn-danger">
                  Sign Out
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Profile
