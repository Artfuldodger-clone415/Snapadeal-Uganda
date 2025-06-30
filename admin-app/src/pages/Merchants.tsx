"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Building2, Mail, Phone, Calendar } from "lucide-react"
import { api } from "../services/api"
import toast from "react-hot-toast"

interface Merchant {
  id: number
  first_name: string
  last_name: string
  email: string
  phone: string
  status: string
  is_verified: boolean
  created_at: string
  deals_count?: number
}

const Merchants: React.FC = () => {
  const [merchants, setMerchants] = useState<Merchant[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchMerchants()
  }, [])

  const fetchMerchants = async () => {
    try {
      const response = await api.get("/admin/users?role=merchant")
      setMerchants(response.data.users || [])
    } catch (error) {
      console.error("Failed to fetch merchants:", error)
      toast.error("Failed to load merchants")
    } finally {
      setLoading(false)
    }
  }

  const handleStatusChange = async (merchantId: number, newStatus: string) => {
    try {
      await api.put(`/admin/users/${merchantId}/status`, { status: newStatus })
      toast.success(`Merchant status updated to ${newStatus}`)
      fetchMerchants()
    } catch (error: any) {
      toast.error(error.response?.data?.error || "Failed to update merchant status")
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
          <h1>Merchant Management</h1>
          <p style={{ color: "var(--text-light)" }}>
            Manage merchant accounts and their business status ({merchants.length} merchants)
          </p>
        </div>
      </div>

      {/* Merchants Table */}
      {merchants.length === 0 ? (
        <div className="card">
          <div className="card-body text-center" style={{ padding: "3rem" }}>
            <Building2 size={48} color="var(--text-light)" style={{ marginBottom: "1rem" }} />
            <h4>No merchants found</h4>
            <p style={{ color: "var(--text-light)" }}>No merchant accounts have been created yet.</p>
          </div>
        </div>
      ) : (
        <div className="card">
          <div className="card-body" style={{ padding: 0 }}>
            <table className="table">
              <thead>
                <tr>
                  <th>Merchant</th>
                  <th>Contact Information</th>
                  <th>Status</th>
                  <th>Verification</th>
                  <th>Joined</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {merchants.map((merchant) => (
                  <tr key={merchant.id}>
                    <td>
                      <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
                        <div
                          style={{
                            width: "40px",
                            height: "40px",
                            borderRadius: "50%",
                            background: "var(--admin-primary)",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            color: "white",
                            fontWeight: "600",
                          }}
                        >
                          <Building2 size={20} />
                        </div>
                        <div>
                          <div style={{ fontWeight: "600", marginBottom: "0.25rem" }}>
                            {merchant.first_name} {merchant.last_name}
                          </div>
                          <div style={{ fontSize: "0.8rem", color: "var(--text-light)" }}>
                            Merchant ID: {merchant.id}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td>
                      <div>
                        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.25rem" }}>
                          <Mail size={14} color="var(--text-light)" />
                          <span style={{ fontSize: "0.9rem" }}>{merchant.email}</span>
                        </div>
                        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                          <Phone size={14} color="var(--text-light)" />
                          <span style={{ fontSize: "0.9rem" }}>{merchant.phone}</span>
                        </div>
                      </div>
                    </td>
                    <td>
                      <span className={`status-badge status-${merchant.status}`}>{merchant.status}</span>
                    </td>
                    <td>
                      <div>
                        <div
                          style={{
                            color: merchant.is_verified ? "var(--success)" : "var(--warning)",
                            fontWeight: "600",
                            marginBottom: "0.25rem",
                          }}
                        >
                          {merchant.is_verified ? "✅ Verified" : "⚠️ Pending"}
                        </div>
                        <div style={{ fontSize: "0.8rem", color: "var(--text-light)" }}>Business verification</div>
                      </div>
                    </td>
                    <td>
                      <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                        <Calendar size={14} color="var(--text-light)" />
                        {formatDate(merchant.created_at)}
                      </div>
                    </td>
                    <td>
                      <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                        <select
                          value={merchant.status}
                          onChange={(e) => handleStatusChange(merchant.id, e.target.value)}
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
                        <button
                          onClick={() => window.open(`mailto:${merchant.email}`, "_blank")}
                          className="btn btn-small btn-outline"
                          style={{ fontSize: "0.7rem", padding: "4px 8px" }}
                        >
                          Contact
                        </button>
                      </div>
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

export default Merchants
