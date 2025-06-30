"use client"
import type React from "react"
import { useState } from "react"
import { Search, LogOut, ChevronDown, User, Settings, Bell } from "lucide-react"
import { useAuth } from "../contexts/AuthContext"

const Navbar: React.FC = () => {
  const { user, logout } = useAuth()
  const [showUserMenu, setShowUserMenu] = useState(false)

  return (
    <nav className="merchant-navbar">
      <div className="navbar-content-merchant">
        {/* Left Section - Search */}
        <div className="navbar-left">
          <div className="search-container-merchant">
            <Search className="search-icon-merchant" />
            <input type="text" placeholder="Search deals, analytics, customers..." className="search-input-merchant" />
          </div>
        </div>

        {/* Right Section - User Actions */}
        <div className="navbar-right">
          {/* Notifications */}
          <div className="navbar-item">
            <div className="notification-dropdown">
              <button className="notification-trigger">
                <Bell size={18} />
                <span className="notification-badge">3</span>
              </button>
            </div>
          </div>

          {/* User Menu */}
          <div className="user-menu-merchant">
            <button className="user-menu-trigger-merchant" onClick={() => setShowUserMenu(!showUserMenu)}>
              <div className="user-avatar-merchant">
                <User size={16} />
              </div>
              <div className="user-info-merchant">
                <span className="user-name-merchant">
                  {user?.first_name} {user?.last_name}
                </span>
                <span className="user-role-merchant">Merchant</span>
              </div>
              <ChevronDown size={16} className="chevron-merchant" />
            </button>

            {showUserMenu && (
              <div className="user-dropdown-merchant">
                <div className="dropdown-header-merchant">
                  <div className="user-avatar-large-merchant">
                    {user?.first_name?.charAt(0)}
                    {user?.last_name?.charAt(0)}
                  </div>
                  <div>
                    <div className="dropdown-user-name">
                      {user?.first_name} {user?.last_name}
                    </div>
                    <div className="dropdown-user-email">{user?.email}</div>
                  </div>
                </div>

                <div className="dropdown-divider-merchant"></div>

                <button className="dropdown-item-merchant">
                  <User size={16} />
                  <span>My Profile</span>
                </button>

                <button className="dropdown-item-merchant">
                  <Settings size={16} />
                  <span>Settings</span>
                </button>

                <div className="dropdown-divider-merchant"></div>

                <button onClick={logout} className="dropdown-item-merchant logout-item-merchant">
                  <LogOut size={16} />
                  <span>Sign Out</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  )
}

export default Navbar
