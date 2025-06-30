"use client"
import type React from "react"
import { useState, useEffect } from "react"
import { Link } from "react-router-dom"
import {
  TrendingUp,
  Package,
  DollarSign,
  Clock,
  CheckCircle,
  XCircle,
  Plus,
  Eye,
  Edit,
  ArrowUpRight,
} from "lucide-react"
import { api } from "../services/api"
import { useAuth } from "../contexts/AuthContext"
import toast from "react-hot-toast"

interface DashboardStats {
  total_deals: number
  active_deals: number
  pending_deals: number
  rejected_deals: number
  total_revenue: number
  total_sales: number
}

interface Deal {
  id: number
  title: string
  status: string
  discount_price: number
  sold_quantity: number
  max_quantity: number
  created_at: string
  category: {
    name: string
  }
}

const Dashboard: React.FC = () => {
  const { user } = useAuth()
  const [stats, setStats] = useState<DashboardStats>({
    total_deals: 0,
    active_deals: 0,
    pending_deals: 0,
    rejected_deals: 0,
    total_revenue: 0,
    total_sales: 0,
  })
  const [recentDeals, setRecentDeals] = useState<Deal[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    try {
      const response = await api.get("/merchant/dashboard/stats")

      setStats(
        response.data.stats || {
          total_deals: 0,
          active_deals: 0,
          pending_deals: 0,
          rejected_deals: 0,
          total_revenue: 0,
          total_sales: 0,
        },
      )

      setRecentDeals(response.data.recent_deals || [])
    } catch (error: any) {
      console.error("Failed to fetch dashboard data:", error)
      toast.error("Failed to load dashboard data")

      setStats({
        total_deals: 0,
        active_deals: 0,
        pending_deals: 0,
        rejected_deals: 0,
        total_revenue: 0,
        total_sales: 0,
      })
      setRecentDeals([])
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
    return new Date(dateString).toLocaleDateString("en-UG", {
      year: "numeric",
      month: "short",
      day: "numeric",
    })
  }

  const getStatusConfig = (status: string) => {
    switch (status) {
      case "approved":
        return {
          icon: CheckCircle,
          color: "var(--primary-green)",
          bg: "rgba(16, 185, 129, 0.1)",
          text: "Active",
        }
      case "pending":
        return {
          icon: Clock,
          color: "var(--accent-orange)",
          bg: "rgba(245, 158, 11, 0.1)",
          text: "Pending",
        }
      case "rejected":
        return {
          icon: XCircle,
          color: "var(--accent-red)",
          bg: "rgba(239, 68, 68, 0.1)",
          text: "Rejected",
        }
      default:
        return {
          icon: Clock,
          color: "var(--text-light)",
          bg: "var(--background-secondary)",
          text: "Unknown",
        }
    }
  }

  if (loading) {
    return (
      <div className="dashboard-loading">
        <div className="spinner-large"></div>
        <p>Loading dashboard...</p>
      </div>
    )
  }

  return (
    <div className="dashboard-page">
      {/* Simple Welcome Header */}
      <div className="dashboard-header">
        <div className="welcome-section">
          <h1>Welcome back, {user?.first_name}! 👋</h1>
          <p>Here's a quick overview of your business performance.</p>
        </div>
        <div className="header-actions">
          <Link to="/deals/create" className="btn btn-primary">
            <Plus size={18} />
            Create Deal
          </Link>
        </div>
      </div>

      {/* Simple Stats Grid */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-header">
            <div className="stat-title">Total Deals</div>
            <div className="stat-icon total">
              <Package size={24} />
            </div>
          </div>
          <div className="stat-value">{stats.total_deals}</div>
          <div className="stat-change">
            <span>All deals created</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-header">
            <div className="stat-title">Active Deals</div>
            <div className="stat-icon active">
              <CheckCircle size={24} />
            </div>
          </div>
          <div className="stat-value">{stats.active_deals}</div>
          <div className="stat-change positive">
            <TrendingUp size={14} />
            <span>Currently live</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-header">
            <div className="stat-title">Pending Review</div>
            <div className="stat-icon pending">
              <Clock size={24} />
            </div>
          </div>
          <div className="stat-value">{stats.pending_deals}</div>
          <div className="stat-change">
            <span>Awaiting approval</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-header">
            <div className="stat-title">Total Revenue</div>
            <div className="stat-icon revenue">
              <DollarSign size={24} />
            </div>
          </div>
          <div className="stat-value">{formatPrice(stats.total_revenue)}</div>
          <div className="stat-change positive">
            <TrendingUp size={14} />
            <span>Total earnings</span>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="dashboard-grid">
        {/* Recent Deals */}
        <div className="dashboard-section">
          <div className="card">
            <div className="card-header">
              <div className="section-title">
                <h4>Recent Deals</h4>
                <p>Your latest deals and their performance</p>
              </div>
              <Link to="/deals" className="btn btn-outline btn-small">
                <ArrowUpRight size={16} />
                View All
              </Link>
            </div>
            <div className="card-body">
              {recentDeals.length === 0 ? (
                <div className="empty-state">
                  <div className="empty-icon">
                    <Package size={48} />
                  </div>
                  <h5>No deals yet</h5>
                  <p>Create your first deal to start selling</p>
                  <Link to="/deals/create" className="btn btn-primary">
                    <Plus size={16} />
                    Create Your First Deal
                  </Link>
                </div>
              ) : (
                <div className="deals-table">
                  <table className="table">
                    <thead>
                      <tr>
                        <th>Deal</th>
                        <th>Status</th>
                        <th>Price</th>
                        <th>Sales</th>
                        <th>Created</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {recentDeals.map((deal) => {
                        const statusConfig = getStatusConfig(deal.status)
                        const StatusIcon = statusConfig.icon

                        return (
                          <tr key={deal.id}>
                            <td>
                              <div className="deal-info">
                                <div className="deal-title">{deal.title}</div>
                                <div className="deal-category">{deal.category.name}</div>
                              </div>
                            </td>
                            <td>
                              <div
                                className="status-badge"
                                style={{
                                  backgroundColor: statusConfig.bg,
                                  color: statusConfig.color,
                                }}
                              >
                                <StatusIcon size={14} />
                                <span>{statusConfig.text}</span>
                              </div>
                            </td>
                            <td className="price-cell">{formatPrice(deal.discount_price)}</td>
                            <td>
                              <div className="sales-info">
                                <span className="sales-count">
                                  {deal.sold_quantity}/{deal.max_quantity}
                                </span>
                                <div className="progress-container">
                                  <div
                                    className="progress-bar"
                                    style={{
                                      width: `${(deal.sold_quantity / deal.max_quantity) * 100}%`,
                                    }}
                                  ></div>
                                </div>
                              </div>
                            </td>
                            <td className="date-cell">{formatDate(deal.created_at)}</td>
                            <td>
                              <div className="table-actions">
                                <Link to={`/deals/edit/${deal.id}`} className="action-btn edit" title="Edit Deal">
                                  <Edit size={14} />
                                </Link>
                                <button
                                  className="action-btn view"
                                  title="View Deal"
                                  onClick={() => window.open(`/deals/${deal.id}`, "_blank")}
                                >
                                  <Eye size={14} />
                                </button>
                              </div>
                            </td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="dashboard-sidebar">
          {/* Tips */}
          <div className="card">
            <div className="card-header">
              <h4>💡 Tips for Success</h4>
            </div>
            <div className="card-body">
              <div className="tips-content">
                <div className="tip-item">
                  <div className="tip-icon">📸</div>
                  <div>
                    <h6>Use Quality Images</h6>
                    <p>High-quality photos increase deal views by 40%</p>
                  </div>
                </div>

                <div className="tip-item">
                  <div className="tip-icon">⏰</div>
                  <div>
                    <h6>Best Times to Post</h6>
                    <p>Launch deals on weekends for better visibility</p>
                  </div>
                </div>

                <div className="tip-item">
                  <div className="tip-icon">💰</div>
                  <div>
                    <h6>Pricing Strategy</h6>
                    <p>30-50% discounts perform best with customers</p>
                  </div>
                </div>

                <div className="help-section">
                  <h6>Need Help?</h6>
                  <p>Contact support for assistance with your deals</p>
                  <button className="btn btn-outline btn-small">Get Help</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Dashboard
