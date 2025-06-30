"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { UsersIcon, Mail, Phone, Calendar } from "lucide-react"
import { api } from "../services/api"
import toast from "react-hot-toast"

interface User {
  id: number
  first_name: string
  last_name: string
  email: string
  phone: string
  role: string
  status: string
  is_verified: boolean
  created_at: string
}

const Users: React.FC = () => {
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState("customer")

  useEffect(() => {
    fetchUsers()
  }, [filter])

  const fetchUsers = async () => {
    try {
      const response = await api.get(`/admin/users?role=${filter}`)
      setUsers(response.data.users || [])
    } catch (error) {
      console.error("Failed to fetch users:", error)
      toast.error("Failed to load users")
    } finally {
      setLoading(false)
    }
  }

  const handleStatusChange = async (userId: number, newStatus: string) => {
    try {
      await api.put(`/admin/users/${userId}/status`, { status: newStatus })
      toast.success(`User status updated to ${newStatus}`)
      fetchUsers()
    } catch (error: any) {
      toast.error(error.response?.data?.error || "Failed to update user status")
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-UG")
  }

  if (loading) {
    return <div className="spinner"></div>
  }

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h1>User Management</h1>
          <p style={{ color: "var(--text-light)" }}>
            Manage customer accounts and their status ({users.length} {filter}s)
          </p>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="card mb-4">
        <div className="card-body" style={{ padding: "1rem" }}>
          <div style={{ display: "flex", gap: "1rem" }}>
            <button
              onClick={() => setFilter("customer")}
              className={`btn btn-small ${filter === "customer" ? "btn-primary" : "btn-outline"}`}
            >
              Customers
            </button>
            <button
              onClick={() => setFilter("merchant")}
              className={`btn btn-small ${filter === "merchant" ? "btn-primary" : "btn-outline"}`}
            >
              Merchants
            </button>
          </div>
        </div>
      </div>

      {/* Users Table */}
      {users.length === 0 ? (
        <div className="card">
          <div className="card-body text-center" style={{ padding: "3rem" }}>
            <UsersIcon size={48} color="var(--text-light)" style={{ marginBottom: "1rem" }} />
            <h4>No {filter}s found</h4>
            <p style={{ color: "var(--text-light)" }}>No {filter} accounts have been created yet.</p>
          </div>
        </div>
      ) : (
        <div className="card">
          <div className="card-body" style={{ padding: 0 }}>
            <table className="table">
              <thead>
                <tr>
                  <th>User</th>
                  <th>Contact</th>
                  <th>Status</th>
                  <th>Verified</th>
                  <th>Joined</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr key={user.id}>
                    <td>
                      <div>
                        <div style={{ fontWeight: "600", marginBottom: "0.25rem" }}>
                          {user.first_name} {user.last_name}
                        </div>
                        <div style={{ fontSize: "0.8rem", color: "var(--text-light)" }}>ID: {user.id}</div>
                      </div>
                    </td>
                    <td>
                      <div>
                        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.25rem" }}>
                          <Mail size={14} color="var(--text-light)" />
                          <span style={{ fontSize: "0.9rem" }}>{user.email}</span>
                        </div>
                        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                          <Phone size={14} color="var(--text-light)" />
                          <span style={{ fontSize: "0.9rem" }}>{user.phone}</span>
                        </div>
                      </div>
                    </td>
                    <td>
                      <span className={`status-badge status-${user.status}`}>{user.status}</span>
                    </td>
                    <td>
                      <span
                        style={{
                          color: user.is_verified ? "var(--success)" : "var(--warning)",
                          fontWeight: "600",
                        }}
                      >
                        {user.is_verified ? "✅ Verified" : "⚠️ Unverified"}
                      </span>
                    </td>
                    <td>
                      <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                        <Calendar size={14} color="var(--text-light)" />
                        {formatDate(user.created_at)}
                      </div>
                    </td>
                    <td>
                      <select
                        value={user.status}
                        onChange={(e) => handleStatusChange(user.id, e.target.value)}
                        style={{
                          padding: "4px 8px",
                          border: "1px solid var(--border-light)",
                          borderRadius: "4px",
                          fontSize: "0.8rem",
                        }}
                      >
                        <option value="active">Active</option>
                        <option value="inactive">Inactive</option>
                        <option value="suspended">Suspended</option>
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}

export default Users
