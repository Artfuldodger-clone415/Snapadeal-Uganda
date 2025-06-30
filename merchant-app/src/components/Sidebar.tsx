"use client"

import type React from "react"
import { Link, useLocation } from "react-router-dom"
import { LayoutDashboard, Package, Plus, User, TrendingUp, Settings } from "lucide-react"

const Sidebar: React.FC = () => {
  const location = useLocation()

  const navItems = [
    { path: "/", icon: LayoutDashboard, label: "Dashboard" },
    { path: "/deals", icon: Package, label: "My Deals" },
    { path: "/deals/create", icon: Plus, label: "Create Deal" },
    { path: "/analytics", icon: TrendingUp, label: "Analytics" },
    { path: "/profile", icon: User, label: "Profile" },
    { path: "/settings", icon: Settings, label: "Settings" },
  ]

  return (
    <div className="sidebar">
      <div className="sidebar-header">
        <Link to="/" className="sidebar-brand">
          Snapadeal
        </Link>
        <p className="sidebar-subtitle">Merchant Portal</p>
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
    </div>
  )
}

export default Sidebar
