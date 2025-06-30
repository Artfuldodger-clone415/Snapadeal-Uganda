"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Package, Eye, CheckCircle, XCircle, Clock } from "lucide-react"
import { api } from "../services/api"
import toast from "react-hot-toast"

interface Deal {
  id: number
  title: string
  original_price: number
  discount_price: number
  discount_percent: number
  image_url: string
  location: string
  status: string
  sold_quantity: number
  max_quantity: number
  created_at: string
  merchant: {
    first_name: string
    last_name: string
  }
  category: {
    name: string
  }
}

const AllDeals: React.FC = () => {
  const [deals, setDeals] = useState<Deal[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState("all")

  useEffect(() => {
    fetchDeals()
  }, [filter])

  const fetchDeals = async () => {
    try {
      console.log("🔄 Fetching all deals for admin...")

      // Use the new admin-specific endpoint
      const params = filter !== "all" ? `?status=${filter}` : ""
      const response = await api.get(`/admin/deals${params}`)
      console.log("✅ Admin deals received:", response.data)

      setDeals(response.data.deals || [])
    } catch (error: any) {
      console.error("❌ Failed to fetch deals:", error)
      console.error("Error response:", error.response)
      toast.error("Failed to load deals")
      setDeals([])
    } finally {
      setLoading(false)
    }
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("en-UG", {
      style: "currency",
      currency: "UGX",
      minimumFractionDigits: 0,
    }).format(price)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-UG")
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "approved":
        return <CheckCircle size={16} color="var(--success)" />
      case "pending":
        return <Clock size={16} color="var(--warning)" />
      case "rejected":
        return <XCircle size={16} color="var(--error)" />
      default:
        return <Clock size={16} color="var(--text-light)" />
    }
  }

  const filteredDeals = deals.filter((deal) => {
    if (filter === "all") return true
    return deal.status === filter
  })

  if (loading) {
    return <div className="spinner"></div>
  }

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h1>All Deals</h1>
          <p style={{ color: "var(--text-light)" }}>Manage all deals across the platform ({deals.length} total)</p>
        </div>
      </div>

      {/* Debug Info */}
      <div
        style={{
          marginBottom: "1rem",
          padding: "1rem",
          background: "#f8f9fa",
          borderRadius: "4px",
          fontSize: "0.8rem",
          border: "1px solid #dee2e6",
        }}
      >
        <strong>🔍 Debug Info:</strong>
        <br />
        API Endpoint: /admin/deals{filter !== "all" ? `?status=${filter}` : ""}
        <br />
        Total Deals Loaded: {deals.length}
        <br />
        Filtered Deals: {filteredDeals.length}
        <br />
        Current Filter: {filter}
        <br />
        <button
          onClick={fetchDeals}
          style={{
            marginTop: "0.5rem",
            padding: "4px 8px",
            background: "#007bff",
            color: "white",
            border: "none",
            borderRadius: "4px",
            cursor: "pointer",
          }}
        >
          🔄 Refresh Deals
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="card mb-4">
        <div className="card-body" style={{ padding: "1rem" }}>
          <div style={{ display: "flex", gap: "1rem" }}>
            <button
              onClick={() => setFilter("all")}
              className={`btn btn-small ${filter === "all" ? "btn-primary" : "btn-outline"}`}
            >
              All Deals ({deals.length})
            </button>
            <button
              onClick={() => setFilter("approved")}
              className={`btn btn-small ${filter === "approved" ? "btn-primary" : "btn-outline"}`}
            >
              Approved ({deals.filter((d) => d.status === "approved").length})
            </button>
            <button
              onClick={() => setFilter("pending")}
              className={`btn btn-small ${filter === "pending" ? "btn-primary" : "btn-outline"}`}
            >
              Pending ({deals.filter((d) => d.status === "pending").length})
            </button>
            <button
              onClick={() => setFilter("rejected")}
              className={`btn btn-small ${filter === "rejected" ? "btn-primary" : "btn-outline"}`}
            >
              Rejected ({deals.filter((d) => d.status === "rejected").length})
            </button>
          </div>
        </div>
      </div>

      {/* Deals Table */}
      {filteredDeals.length === 0 ? (
        <div className="card">
          <div className="card-body text-center" style={{ padding: "3rem" }}>
            <Package size={48} color="var(--text-light)" style={{ marginBottom: "1rem" }} />
            <h4>No deals found</h4>
            <p style={{ color: "var(--text-light)" }}>
              {filter === "all" ? "No deals have been created yet." : `No ${filter} deals found.`}
            </p>
          </div>
        </div>
      ) : (
        <div className="card">
          <div className="card-body" style={{ padding: 0 }}>
            <table className="table">
              <thead>
                <tr>
                  <th>Deal</th>
                  <th>Merchant</th>
                  <th>Category</th>
                  <th>Status</th>
                  <th>Price</th>
                  <th>Sales</th>
                  <th>Created</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredDeals.map((deal) => (
                  <tr key={deal.id}>
                    <td>
                      <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
                        <img
                          src={deal.image_url || "/placeholder.svg?height=50&width=50"}
                          alt={deal.title}
                          style={{
                            width: "50px",
                            height: "50px",
                            objectFit: "cover",
                            borderRadius: "4px",
                          }}
                        />
                        <div>
                          <div style={{ fontWeight: "600", marginBottom: "0.25rem" }}>{deal.title}</div>
                          <div style={{ fontSize: "0.8rem", color: "var(--text-light)" }}>{deal.location}</div>
                        </div>
                      </div>
                    </td>
                    <td>
                      {deal.merchant?.first_name} {deal.merchant?.last_name}
                    </td>
                    <td>{deal.category?.name}</td>
                    <td>
                      <div className="d-flex align-items-center" style={{ gap: "0.5rem" }}>
                        {getStatusIcon(deal.status)}
                        <span className={`status-badge status-${deal.status}`}>{deal.status}</span>
                      </div>
                    </td>
                    <td>
                      <div>
                        <div style={{ fontWeight: "600" }}>{formatPrice(deal.discount_price)}</div>
                        <div
                          style={{
                            fontSize: "0.8rem",
                            color: "var(--text-light)",
                            textDecoration: "line-through",
                          }}
                        >
                          {formatPrice(deal.original_price)}
                        </div>
                      </div>
                    </td>
                    <td>
                      <div>
                        <div style={{ fontWeight: "600" }}>
                          {deal.sold_quantity}/{deal.max_quantity}
                        </div>
                        <div style={{ fontSize: "0.8rem", color: "var(--text-light)" }}>
                          {Math.round((deal.sold_quantity / deal.max_quantity) * 100)}% sold
                        </div>
                      </div>
                    </td>
                    <td>{formatDate(deal.created_at)}</td>
                    <td>
                      <button
                        onClick={() => window.open(`http://localhost:3000/deals/${deal.id}`, "_blank")}
                        className="btn btn-small btn-outline"
                        title="View Deal"
                      >
                        <Eye size={14} />
                      </button>
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

export default AllDeals
