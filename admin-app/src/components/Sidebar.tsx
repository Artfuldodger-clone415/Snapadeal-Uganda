"use client"

import type React from "react"
import { Link, useLocation } from "react-router-dom"
import { LayoutDashboard, Clock, Package, Users, Building2, BarChart3, Settings, LogOut, Shield } from "lucide-react"
import { useAuth } from "../contexts/AuthContext"

const Sidebar: React.FC = () => {
  const location = useLocation()
  const { logout } = useAuth()

  const navItems = [
    { path: "/", icon: LayoutDashboard, label: "Dashboard" },
    { path: "/deals/pending", icon: Clock, label: "Pending Deals" },
    { path: "/deals/all", icon: Package, label: "All Deals" },
    { path: "/users", icon: Users, label: "Customers" },
    { path: "/merchants", icon: Building2, label: "Merchants" },
    { path: "/analytics", icon: BarChart3, label: "Analytics" },
    { path: "/settings", icon: Settings, label: "Settings" },
  ]

  const handleLogout = () => {
    logout()
  }

  return (
    <div className="sidebar">
      <div className="sidebar-header">
        <Link to="/" className="sidebar-brand">
          <Shield size={24} style={{ marginRight: "0.5rem" }} />
          Snapadeal
        </Link>
        <p style={{ fontSize: "0.8rem", color: "#a0aec0", marginTop: "0.5rem" }}>Admin Portal</p>
      </div>

      <nav className="sidebar-nav">
        {navItems.map((item) => {
          const Icon = item.icon
          const isActive = location.pathname === item.path

          return (
            <div key={item.path} className="nav-item">
              <Link to={item.path} className={`nav-link ${isActive ? "active" : ""}`}>
                <Icon size={20} />
                {item.label}
              </Link>
            </div>
          )
        })}
      </nav>

      <div style={{ marginTop: "auto", padding: "1rem" }}>
        <button
          onClick={handleLogout}
          className="nav-link"
          style={{
            width: "100%",
            background: "none",
            border: "none",
            color: "#a0aec0",
            cursor: "pointer",
          }}
        >
          <LogOut size={20} />
          Logout
        </button>
      </div>
    </div>
  )
}

export default Sidebar
