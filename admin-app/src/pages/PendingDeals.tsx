"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { CheckCircle, XCircle, Eye, Clock } from "lucide-react"
import { api } from "../services/api"
import toast from "react-hot-toast"

interface Deal {
  id: number
  title: string
  description: string
  original_price: number
  discount_price: number
  discount_percent: number
  image_url: string
  location: string
  status: string
  created_at: string
  merchant: {
    first_name: string
    last_name: string
    email: string
  }
  category: {
    name: string
  }
}

const PendingDeals: React.FC = () => {
  const [deals, setDeals] = useState<Deal[]>([])
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState<number | null>(null)

  useEffect(() => {
    fetchPendingDeals()
  }, [])

  const fetchPendingDeals = async () => {
    try {
      const response = await api.get("/admin/deals/pending")
      setDeals(response.data.deals || [])
    } catch (error) {
      console.error("Failed to fetch pending deals:", error)
      toast.error("Failed to load pending deals")
    } finally {
      setLoading(false)
    }
  }

  const handleApproveDeal = async (dealId: number) => {
    setActionLoading(dealId)
    try {
      await api.put(`/admin/deals/${dealId}/approve`)
      toast.success("Deal approved successfully!")
      fetchPendingDeals()
    } catch (error: any) {
      toast.error(error.response?.data?.error || "Failed to approve deal")
    } finally {
      setActionLoading(null)
    }
  }

  const handleRejectDeal = async (dealId: number) => {
    const reason = window.prompt("Please provide a reason for rejection:")
    if (!reason) return

    setActionLoading(dealId)
    try {
      await api.put(`/admin/deals/${dealId}/reject`, { reason })
      toast.success("Deal rejected")
      fetchPendingDeals()
    } catch (error: any) {
      toast.error(error.response?.data?.error || "Failed to reject deal")
    } finally {
      setActionLoading(null)
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

  if (loading) {
    return <div className="spinner"></div>
  }

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h1>Pending Deals</h1>
          <p style={{ color: "var(--text-light)" }}>
            Review and approve deals submitted by merchants ({deals.length} pending)
          </p>
        </div>
      </div>

      {deals.length === 0 ? (
        <div className="card">
          <div className="card-body text-center" style={{ padding: "3rem" }}>
            <Clock size={48} color="var(--text-light)" style={{ marginBottom: "1rem" }} />
            <h4>No pending deals</h4>
            <p style={{ color: "var(--text-light)" }}>
              All deals have been reviewed. New submissions will appear here.
            </p>
          </div>
        </div>
      ) : (
        <div>
          {deals.map((deal) => (
            <div key={deal.id} className="card mb-4">
              <div className="card-body">
                <div className="row">
                  <div className="col-3">
                    <img
                      src={deal.image_url || "/placeholder.svg?height=200&width=300"}
                      alt={deal.title}
                      style={{
                        width: "100%",
                        height: "200px",
                        objectFit: "cover",
                        borderRadius: "8px",
                      }}
                    />
                  </div>

                  <div className="col-6">
                    <h4>{deal.title}</h4>
                    <p style={{ color: "var(--text-light)", marginBottom: "1rem" }}>
                      by {deal.merchant.first_name} {deal.merchant.last_name} ({deal.merchant.email})
                    </p>

                    <div style={{ marginBottom: "1rem" }}>
                      <strong>Category:</strong> {deal.category.name}
                      <br />
                      <strong>Location:</strong> {deal.location}
                      <br />
                      <strong>Submitted:</strong> {formatDate(deal.created_at)}
                    </div>

                    <div style={{ marginBottom: "1rem" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
                        <div>
                          <strong>Deal Price:</strong>
                          <div style={{ fontSize: "1.2rem", color: "var(--primary-green)", fontWeight: "600" }}>
                            {formatPrice(deal.discount_price)}
                          </div>
                        </div>
                        <div>
                          <strong>Original Price:</strong>
                          <div style={{ textDecoration: "line-through", color: "var(--text-light)" }}>
                            {formatPrice(deal.original_price)}
                          </div>
                        </div>
                        <div>
                          <strong>Discount:</strong>
                          <div
                            style={{
                              background: "var(--accent-orange)",
                              color: "white",
                              padding: "4px 8px",
                              borderRadius: "4px",
                              fontSize: "0.9rem",
                              fontWeight: "600",
                            }}
                          >
                            {deal.discount_percent}% OFF
                          </div>
                        </div>
                      </div>
                    </div>

                    <div>
                      <strong>Description:</strong>
                      <p style={{ marginTop: "0.5rem", lineHeight: "1.5" }}>{deal.description}</p>
                    </div>
                  </div>

                  <div className="col-3">
                    <div style={{ display: "flex", flexDirection: "column", gap: "1rem", height: "100%" }}>
                      <button
                        onClick={() => window.open(`http://localhost:3000/deals/${deal.id}`, "_blank")}
                        className="btn btn-outline"
                        style={{ display: "flex", alignItems: "center", justifyContent: "center" }}
                      >
                        <Eye size={16} style={{ marginRight: "0.5rem" }} />
                        Preview Deal
                      </button>

                      <div style={{ marginTop: "auto", display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                        <button
                          onClick={() => handleApproveDeal(deal.id)}
                          disabled={actionLoading === deal.id}
                          className="btn btn-success"
                          style={{ display: "flex", alignItems: "center", justifyContent: "center" }}
                        >
                          <CheckCircle size={16} style={{ marginRight: "0.5rem" }} />
                          {actionLoading === deal.id ? "Approving..." : "Approve Deal"}
                        </button>

                        <button
                          onClick={() => handleRejectDeal(deal.id)}
                          disabled={actionLoading === deal.id}
                          className="btn btn-danger"
                          style={{ display: "flex", alignItems: "center", justifyContent: "center" }}
                        >
                          <XCircle size={16} style={{ marginRight: "0.5rem" }} />
                          Reject Deal
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default PendingDeals
