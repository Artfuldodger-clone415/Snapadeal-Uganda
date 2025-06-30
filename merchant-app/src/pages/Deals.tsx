"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Link } from "react-router-dom"
import { Plus, Search, Grid, List, Edit, Trash2, Clock, CheckCircle, XCircle, Package, Filter } from "lucide-react"
import { api } from "../services/api"
import toast from "react-hot-toast"

interface Deal {
  id: number
  title: string
  description: string
  short_description: string
  original_price: number
  discount_price: number
  status: string
  sold_quantity: number
  max_quantity: number
  start_date: string
  end_date: string
  image_url: string
  category: {
    name: string
  }
}

const Deals: React.FC = () => {
  const [deals, setDeals] = useState<Deal[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid")

  useEffect(() => {
    fetchDeals()
  }, [])

  const fetchDeals = async () => {
    try {
      const response = await api.get("/merchant/deals")
      setDeals(response.data.deals || [])
    } catch (error) {
      console.error("Failed to fetch deals:", error)
      toast.error("Failed to load deals")
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteDeal = async (dealId: number) => {
    if (!window.confirm("Are you sure you want to delete this deal?")) return

    try {
      await api.delete(`/deals/${dealId}`)
      setDeals(deals.filter((deal) => deal.id !== dealId))
      toast.success("Deal deleted successfully")
    } catch (error) {
      toast.error("Failed to delete deal")
    }
  }

  const filteredDeals = deals.filter((deal) => {
    const matchesSearch =
      deal.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      deal.description.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === "all" || deal.status === statusFilter
    return matchesSearch && matchesStatus
  })

  const getStatusCounts = () => {
    return {
      all: deals.length,
      pending: deals.filter((d) => d.status === "pending").length,
      approved: deals.filter((d) => d.status === "approved").length,
      rejected: deals.filter((d) => d.status === "rejected").length,
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

  const calculateDiscount = (original: number, discount: number) => {
    return Math.round(((original - discount) / original) * 100)
  }

  const calculateProgress = (sold: number, max: number) => {
    return max > 0 ? (sold / max) * 100 : 0
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "approved":
        return <CheckCircle size={16} />
      case "pending":
        return <Clock size={16} />
      case "rejected":
        return <XCircle size={16} />
      default:
        return <Clock size={16} />
    }
  }

  const statusCounts = getStatusCounts()

  if (loading) {
    return (
      <div className="dashboard-loading">
        <div className="spinner-large"></div>
        <p>Loading deals...</p>
      </div>
    )
  }

  return (
    <div className="dashboard-page">
      {/* Header */}
      <div className="dashboard-header">
        <div className="welcome-section">
          <h1>My Deals</h1>
          <p>Manage and track all your deals in one place</p>
        </div>
        <div className="header-actions">
          <Link to="/deals/create" className="btn btn-primary">
            <Plus size={18} />
            Create New Deal
          </Link>
        </div>
      </div>

      {/* Deals Container */}
      <div className="deals-container">
        <div className="deals-header">
          {/* Filter Tabs */}
          <div className="deals-filters">
            <button
              className={`filter-tab ${statusFilter === "all" ? "active" : ""}`}
              onClick={() => setStatusFilter("all")}
            >
              <Filter size={16} />
              All Deals
              <span className="filter-count">{statusCounts.all}</span>
            </button>
            <button
              className={`filter-tab ${statusFilter === "pending" ? "active" : ""}`}
              onClick={() => setStatusFilter("pending")}
            >
              <Clock size={16} />
              Pending
              <span className="filter-count">{statusCounts.pending}</span>
            </button>
            <button
              className={`filter-tab ${statusFilter === "approved" ? "active" : ""}`}
              onClick={() => setStatusFilter("approved")}
            >
              <CheckCircle size={16} />
              Active
              <span className="filter-count">{statusCounts.approved}</span>
            </button>
            <button
              className={`filter-tab ${statusFilter === "rejected" ? "active" : ""}`}
              onClick={() => setStatusFilter("rejected")}
            >
              <XCircle size={16} />
              Rejected
              <span className="filter-count">{statusCounts.rejected}</span>
            </button>
          </div>

          {/* Controls */}
          <div className="deals-controls">
            <div className="search-deals">
              <Search className="search-icon" size={18} />
              <input
                type="text"
                placeholder="Search deals..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            <div className="view-toggle">
              <button className={`view-btn ${viewMode === "grid" ? "active" : ""}`} onClick={() => setViewMode("grid")}>
                <Grid size={16} />
              </button>
              <button className={`view-btn ${viewMode === "list" ? "active" : ""}`} onClick={() => setViewMode("list")}>
                <List size={16} />
              </button>
            </div>
          </div>
        </div>

        {/* Deals Content */}
        {filteredDeals.length === 0 ? (
          <div className="empty-state">
            <Package size={64} className="empty-state-icon" />
            <h3>No deals found</h3>
            <p>
              {searchTerm || statusFilter !== "all"
                ? "Try adjusting your search or filters"
                : "Create your first deal to get started"}
            </p>
            {!searchTerm && statusFilter === "all" && (
              <Link to="/deals/create" className="btn btn-primary">
                <Plus size={16} />
                Create Your First Deal
              </Link>
            )}
          </div>
        ) : viewMode === "grid" ? (
          <div className="deals-grid">
            {filteredDeals.map((deal) => (
              <div key={deal.id} className="deal-card">
                <div className="deal-status">
                  <span className={`status-badge status-${deal.status}`}>
                    {getStatusIcon(deal.status)}
                    {deal.status}
                  </span>
                </div>

                <div className="deal-discount">{calculateDiscount(deal.original_price, deal.discount_price)}% OFF</div>

                <img
                  src={deal.image_url || "/placeholder.svg?height=200&width=320"}
                  alt={deal.title}
                  className="deal-image"
                />

                <div className="deal-content">
                  <div className="deal-category">{deal.category.name}</div>
                  <h3 className="deal-title">{deal.title}</h3>
                  <p className="deal-description">{deal.short_description}</p>

                  <div className="deal-pricing">
                    <span className="deal-price">{formatPrice(deal.discount_price)}</span>
                    <span className="deal-original-price">{formatPrice(deal.original_price)}</span>
                  </div>

                  <div className="deal-stats">
                    <div className="deal-stat">
                      <div className="deal-stat-value">
                        {deal.sold_quantity}/{deal.max_quantity}
                      </div>
                      <div className="deal-stat-label">Sold</div>
                    </div>
                    <div className="deal-stat">
                      <div className="deal-stat-value">
                        {Math.round(calculateProgress(deal.sold_quantity, deal.max_quantity))}%
                      </div>
                      <div className="deal-stat-label">Progress</div>
                    </div>
                    <div className="deal-stat">
                      <div className="deal-stat-value">{formatDate(deal.end_date)}</div>
                      <div className="deal-stat-label">Expires</div>
                    </div>
                  </div>

                  <div className="deal-progress">
                    <div className="progress-bar">
                      <div
                        className="progress-fill"
                        style={{ width: `${calculateProgress(deal.sold_quantity, deal.max_quantity)}%` }}
                      />
                    </div>
                  </div>

                  <div className="deal-actions">
                    <Link to={`/deals/edit/${deal.id}`} className="btn btn-outline">
                      <Edit size={14} />
                      Edit
                    </Link>
                    <button
                      onClick={() => handleDeleteDeal(deal.id)}
                      className="btn btn-outline"
                      style={{ color: "var(--accent-red)", borderColor: "var(--accent-red)" }}
                    >
                      <Trash2 size={14} />
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="deals-list">
            {filteredDeals.map((deal) => (
              <div key={deal.id} className="deal-list-item">
                <img
                  src={deal.image_url || "/placeholder.svg?height=80&width=120"}
                  alt={deal.title}
                  className="deal-list-image"
                />

                <div className="deal-list-content">
                  <div className="deal-list-header">
                    <div>
                      <div className="deal-category">{deal.category.name}</div>
                      <h3 className="deal-title">{deal.title}</h3>
                      <p className="deal-description">{deal.short_description}</p>
                    </div>
                    <div className="deal-status">
                      <span className={`status-badge status-${deal.status}`}>
                        {getStatusIcon(deal.status)}
                        {deal.status}
                      </span>
                    </div>
                  </div>

                  <div className="deal-list-meta">
                    <div className="deal-pricing">
                      <span className="deal-price">{formatPrice(deal.discount_price)}</span>
                      <span className="deal-original-price">{formatPrice(deal.original_price)}</span>
                      <span className="deal-discount">
                        {calculateDiscount(deal.original_price, deal.discount_price)}% OFF
                      </span>
                    </div>

                    <div className="deal-stat">
                      <span className="deal-stat-value">
                        {deal.sold_quantity}/{deal.max_quantity} Sold
                      </span>
                    </div>

                    <div className="deal-stat">
                      <span className="deal-stat-value">Expires {formatDate(deal.end_date)}</span>
                    </div>
                  </div>
                </div>

                <div className="deal-list-actions">
                  <Link to={`/deals/edit/${deal.id}`} className="btn btn-outline btn-small">
                    <Edit size={14} />
                    Edit
                  </Link>
                  <button
                    onClick={() => handleDeleteDeal(deal.id)}
                    className="btn btn-outline btn-small"
                    style={{ color: "var(--accent-red)", borderColor: "var(--accent-red)" }}
                  >
                    <Trash2 size={14} />
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default Deals
