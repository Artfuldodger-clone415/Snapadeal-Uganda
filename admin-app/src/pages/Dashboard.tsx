"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Users, Building2, Package, DollarSign, TrendingUp, Clock, CheckCircle, AlertTriangle } from "lucide-react"
import { api } from "../services/api"
import { useAuth } from "../contexts/AuthContext"
import toast from "react-hot-toast"

interface DashboardStats {
  total_users: number
  total_merchants: number
  total_customers: number
  total_deals: number
  pending_deals: number
  approved_deals: number
  rejected_deals: number
  total_revenue: number
  total_sales: number
}

interface Activity {
  id: number
  type: string
  description: string
  timestamp: string
  status: string
}

const Dashboard: React.FC = () => {
  const { user } = useAuth()
  const [stats, setStats] = useState<DashboardStats>({
    total_users: 0,
    total_merchants: 0,
    total_customers: 0,
    total_deals: 0,
    pending_deals: 0,
    approved_deals: 0,
    rejected_deals: 0,
    total_revenue: 0,
    total_sales: 0,
  })
  const [recentActivity, setRecentActivity] = useState<Activity[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    try {
      console.log("🔄 Fetching admin dashboard data...")

      // Use the new admin-specific endpoint
      const response = await api.get("/admin/dashboard/stats")
      console.log("✅ Admin dashboard data received:", response.data)

      setStats(
        response.data.stats || {
          total_users: 0,
          total_merchants: 0,
          total_customers: 0,
          total_deals: 0,
          pending_deals: 0,
          approved_deals: 0,
          rejected_deals: 0,
          total_revenue: 0,
          total_sales: 0,
        },
      )

      setRecentActivity(response.data.recent_activity || [])
    } catch (error: any) {
      console.error("❌ Failed to fetch dashboard data:", error)
      console.error("Error response:", error.response)
      toast.error("Failed to load dashboard data")

      // Set empty state on error
      setStats({
        total_users: 0,
        total_merchants: 0,
        total_customers: 0,
        total_deals: 0,
        pending_deals: 0,
        approved_deals: 0,
        rejected_deals: 0,
        total_revenue: 0,
        total_sales: 0,
      })
      setRecentActivity([])
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
    return new Date(dateString).toLocaleString("en-UG")
  }

  const getActivityIcon = (type: string) => {
    switch (type) {
      case "deal_pending":
        return <Package size={16} color="var(--warning)" />
      case "deal_approved":
        return <CheckCircle size={16} color="var(--success)" />
      case "deal_rejected":
        return <AlertTriangle size={16} color="var(--error)" />
      case "merchant_registered":
        return <Building2 size={16} color="var(--info)" />
      default:
        return <AlertTriangle size={16} color="var(--text-light)" />
    }
  }

  if (loading) {
    return <div className="spinner"></div>
  }

  return (
    <div>
      {/* Welcome Header */}
      <div className="mb-4">
        <h1>Admin Dashboard</h1>
        <p style={{ color: "var(--text-light)" }}>
          Welcome back, {user?.first_name}! Here's what's happening on Snapadeal today.
        </p>
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
        API Endpoint: /admin/dashboard/stats
        <br />
        Total Users: {stats.total_users}
        <br />
        Total Merchants: {stats.total_merchants}
        <br />
        Total Deals: {stats.total_deals}
        <br />
        Pending Deals: {stats.pending_deals}
        <br />
        Recent Activity Count: {recentActivity.length}
        <br />
        <button
          onClick={fetchDashboardData}
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
          🔄 Refresh Data
        </button>
      </div>

      {/* Stats Grid */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="d-flex justify-content-between align-items-center">
            <div>
              <h3>{stats.total_customers}</h3>
              <p style={{ color: "var(--text-light)", margin: 0 }}>Total Customers</p>
            </div>
            <Users size={32} color="var(--admin-primary)" />
          </div>
        </div>

        <div className="stat-card">
          <div className="d-flex justify-content-between align-items-center">
            <div>
              <h3>{stats.total_merchants}</h3>
              <p style={{ color: "var(--text-light)", margin: 0 }}>Active Merchants</p>
            </div>
            <Building2 size={32} color="var(--success)" />
          </div>
        </div>

        <div className="stat-card">
          <div className="d-flex justify-content-between align-items-center">
            <div>
              <h3>{stats.pending_deals}</h3>
              <p style={{ color: "var(--text-light)", margin: 0 }}>Pending Approval</p>
            </div>
            <Clock size={32} color="var(--warning)" />
          </div>
        </div>

        <div className="stat-card">
          <div className="d-flex justify-content-between align-items-center">
            <div>
              <h3>{stats.total_deals}</h3>
              <p style={{ color: "var(--text-light)", margin: 0 }}>Total Deals</p>
            </div>
            <Package size={32} color="var(--info)" />
          </div>
        </div>

        <div className="stat-card">
          <div className="d-flex justify-content-between align-items-center">
            <div>
              <h3>{formatPrice(stats.total_revenue)}</h3>
              <p style={{ color: "var(--text-light)", margin: 0 }}>Platform Revenue</p>
            </div>
            <DollarSign size={32} color="var(--accent-orange)" />
          </div>
        </div>

        <div className="stat-card">
          <div className="d-flex justify-content-between align-items-center">
            <div>
              <h3>{Math.round((stats.approved_deals / Math.max(stats.total_deals, 1)) * 100)}%</h3>
              <p style={{ color: "var(--text-light)", margin: 0 }}>Approval Rate</p>
            </div>
            <TrendingUp size={32} color="var(--primary-green)" />
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="row">
        <div className="col-8">
          <div className="card">
            <div className="card-header">
              <h4>Recent Activity</h4>
            </div>
            <div className="card-body">
              {recentActivity.length === 0 ? (
                <div className="text-center" style={{ padding: "2rem" }}>
                  <AlertTriangle size={48} color="var(--text-light)" style={{ marginBottom: "1rem" }} />
                  <h5>No recent activity</h5>
                  <p style={{ color: "var(--text-light)" }}>
                    Activity will appear here as users interact with the platform
                  </p>
                </div>
              ) : (
                <div>
                  {recentActivity.map((activity) => (
                    <div
                      key={activity.id}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        padding: "1rem 0",
                        borderBottom: "1px solid var(--border-light)",
                      }}
                    >
                      <div style={{ marginRight: "1rem" }}>{getActivityIcon(activity.type)}</div>
                      <div style={{ flex: 1 }}>
                        <p style={{ margin: 0, fontWeight: "500" }}>{activity.description}</p>
                        <small style={{ color: "var(--text-light)" }}>{formatDate(activity.timestamp)}</small>
                      </div>
                      <span className={`status-badge status-${activity.status}`}>{activity.status}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="col-4">
          <div className="card">
            <div className="card-header">
              <h4>Quick Actions</h4>
            </div>
            <div className="card-body">
              <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                <a href="/deals/pending" className="btn btn-warning">
                  <Clock size={16} style={{ marginRight: "0.5rem" }} />
                  Review Pending Deals ({stats.pending_deals})
                </a>
                <a href="/merchants" className="btn btn-primary">
                  <Building2 size={16} style={{ marginRight: "0.5rem" }} />
                  Manage Merchants
                </a>
                <a href="/users" className="btn btn-outline">
                  <Users size={16} style={{ marginRight: "0.5rem" }} />
                  View All Users
                </a>
                <a href="/analytics" className="btn btn-outline">
                  <TrendingUp size={16} style={{ marginRight: "0.5rem" }} />
                  View Analytics
                </a>
              </div>
            </div>
          </div>

          <div className="card">
            <div className="card-header">
              <h4>System Status</h4>
            </div>
            <div className="card-body">
              <div style={{ fontSize: "0.9rem", lineHeight: "1.6" }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.5rem" }}>
                  <span>Database:</span>
                  <span style={{ color: "var(--success)", fontWeight: "600" }}>✅ Online</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.5rem" }}>
                  <span>Payment Gateway:</span>
                  <span style={{ color: "var(--success)", fontWeight: "600" }}>✅ Connected</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.5rem" }}>
                  <span>Email Service:</span>
                  <span style={{ color: "var(--warning)", fontWeight: "600" }}>⚠️ Not Configured</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <span>Storage:</span>
                  <span style={{ color: "var(--success)", fontWeight: "600" }}>✅ Available</span>
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
