"use client"

import type React from "react"
import { Search, Shield, LogOut } from "lucide-react"
import { useAuth } from "../contexts/AuthContext"
import AdminNotificationDropdown from "./NotificationDropdown"

const Navbar: React.FC = () => {
  const { user, logout } = useAuth()

  return (
    <div className="navbar">
      <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
        <div style={{ position: "relative" }}>
          <Search
            size={20}
            style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", color: "#666" }}
          />
          <input
            type="text"
            placeholder="Search users, deals, merchants..."
            style={{
              paddingLeft: "40px",
              padding: "8px 12px",
              border: "1px solid #e0e0e0",
              borderRadius: "4px",
              width: "350px",
              fontSize: "0.9rem",
            }}
          />
        </div>
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
        <AdminNotificationDropdown />

        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
          <div
            style={{
              width: "32px",
              height: "32px",
              borderRadius: "50%",
              background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "white",
              fontWeight: "600",
            }}
          >
            <Shield size={16} />
          </div>
          <div>
            <div style={{ fontSize: "14px", fontWeight: "600" }}>
              {user?.first_name} {user?.last_name}
            </div>
            <div style={{ fontSize: "12px", color: "#666" }}>System Administrator</div>
          </div>
        </div>

        <button
          onClick={logout}
          style={{
            background: "transparent",
            border: "1px solid #e0e0e0",
            padding: "8px 12px",
            borderRadius: "4px",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            gap: "0.5rem",
            color: "#666",
            fontSize: "0.9rem",
          }}
        >
          <LogOut size={16} />
          Logout
        </button>
      </div>
    </div>
  )
}

export default Navbar
