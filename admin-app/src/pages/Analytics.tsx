"use client"

import type React from "react"
import { useState } from "react"
import { BarChart3, Users, Package, DollarSign } from "lucide-react"

const Analytics: React.FC = () => {
  const [loading, setLoading] = useState(false)

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h1>Analytics Dashboard</h1>
          <p style={{ color: "var(--text-light)" }}>Platform performance metrics and insights</p>
        </div>
      </div>

      {/* Coming Soon */}
      <div className="card">
        <div className="card-body text-center" style={{ padding: "4rem" }}>
          <BarChart3 size={64} color="var(--text-light)" style={{ marginBottom: "2rem" }} />
          <h3>Analytics Dashboard Coming Soon</h3>
          <p style={{ color: "var(--text-light)", marginBottom: "2rem", maxWidth: "500px", margin: "0 auto" }}>
            We're building comprehensive analytics to help you understand platform performance, user behavior, and
            business insights.
          </p>

          <div className="row" style={{ marginTop: "3rem" }}>
            <div className="col-4">
              <div style={{ textAlign: "center", padding: "1rem" }}>
                <Users size={32} color="var(--admin-primary)" style={{ marginBottom: "1rem" }} />
                <h5>User Analytics</h5>
                <p style={{ fontSize: "0.9rem", color: "var(--text-light)" }}>
                  Track user registration, engagement, and retention metrics
                </p>
              </div>
            </div>
            <div className="col-4">
              <div style={{ textAlign: "center", padding: "1rem" }}>
                <Package size={32} color="var(--success)" style={{ marginBottom: "1rem" }} />
                <h5>Deal Performance</h5>
                <p style={{ fontSize: "0.9rem", color: "var(--text-light)" }}>
                  Monitor deal success rates, popular categories, and conversion metrics
                </p>
              </div>
            </div>
            <div className="col-4">
              <div style={{ textAlign: "center", padding: "1rem" }}>
                <DollarSign size={32} color="var(--accent-orange)" style={{ marginBottom: "1rem" }} />
                <h5>Revenue Insights</h5>
                <p style={{ fontSize: "0.9rem", color: "var(--text-light)" }}>
                  Analyze revenue trends, merchant performance, and platform growth
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Analytics
