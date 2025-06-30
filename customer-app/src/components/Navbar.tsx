"use client"
import type React from "react"
import { useState, useEffect } from "react"
import { Link, useNavigate, useLocation } from "react-router-dom"
import { useAuth } from "../contexts/AuthContext"
import { Home, ShoppingBag, User, ShoppingCart, LogOut, Settings, Search, Bell, Grid3X3 } from "lucide-react"
import { api } from "../services/api"

interface Category {
  id: number
  name: string
  description: string
  icon_url: string
}

const Navbar: React.FC = () => {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [showUserMenu, setShowUserMenu] = useState(false)
  const [showCategories, setShowCategories] = useState(false)
  const [showNotifications, setShowNotifications] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [categories, setCategories] = useState<Category[]>([])

  // Category icons mapping
  const categoryIcons: { [key: string]: string } = {
    "Food & Dining": "🍽️",
    "Beauty & Spa": "💄",
    "Health & Fitness": "💪",
    Entertainment: "🎬",
    "Travel & Hotels": "✈️",
    Shopping: "🛍️",
    Automotive: "🚗",
    "Home & Garden": "🏠",
    Education: "📚",
    Services: "🔧",
  }

  useEffect(() => {
    fetchCategories()
  }, [])

  const fetchCategories = async () => {
    try {
      const response = await api.get("/categories")
      if (response.data && response.data.categories) {
        setCategories(response.data.categories)
      }
    } catch (error) {
      console.error("Failed to fetch categories:", error)
    }
  }

  const handleLogout = () => {
    logout()
    navigate("/")
    setShowUserMenu(false)
  }

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen)
  }

  const isActive = (path: string) => {
    return location.pathname === path
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      navigate(`/deals?search=${encodeURIComponent(searchQuery)}`)
      setSearchQuery("")
    }
  }

  const handleCategoryClick = (categoryId: number) => {
    navigate(`/deals?category_id=${categoryId}`)
    setShowCategories(false)
  }

  return (
    <nav className="navbar">
      <div className="container">
        <div className="navbar-content">
          {/* Logo */}
          <Link to="/" className="navbar-brand">
            <img src="/logo.png" alt="Snapadeal" className="navbar-logo" />
            <span className="navbar-brand-text">Snapadeal</span>
          </Link>

          {/* Search Bar */}
          <div className="navbar-search">
            <form onSubmit={handleSearch} className="navbar-search-container">
              <Search size={16} className="navbar-search-icon" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search for deals, restaurants, activities..."
                className="navbar-search-input"
              />
            </form>
          </div>

          {/* Categories Dropdown */}
          <div className="navbar-categories">
            <button className="categories-dropdown-trigger" onClick={() => setShowCategories(!showCategories)}>
              <Grid3X3 size={16} />
              <span>Categories</span>
            </button>

            {showCategories && (
              <div className="categories-dropdown">
                {categories.map((category) => (
                  <button
                    key={category.id}
                    onClick={() => handleCategoryClick(category.id)}
                    className="category-dropdown-item"
                  >
                    <span className="category-icon">{categoryIcons[category.name] || "🏷️"}</span>
                    <div>
                      <div style={{ fontWeight: "600", fontSize: "14px" }}>{category.name}</div>
                      <div style={{ fontSize: "12px", color: "var(--text-light)" }}>{category.description}</div>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Desktop Navigation */}
          <div className="navbar-nav-desktop">
            <ul className="navbar-nav">
              <li className="nav-item">
                <Link to="/" className={`nav-link ${isActive("/") ? "nav-link-active" : ""}`}>
                  <Home size={18} />
                  <span>Home</span>
                </Link>
              </li>
              <li className="nav-item">
                <Link to="/deals" className={`nav-link ${isActive("/deals") ? "nav-link-active" : ""}`}>
                  <ShoppingBag size={18} />
                  <span>Deals</span>
                </Link>
              </li>

              {user ? (
                <>
                  <li className="nav-item">
                    <Link
                      to="/transactions"
                      className={`nav-link ${isActive("/transactions") ? "nav-link-active" : ""}`}
                    >
                      <ShoppingCart size={18} />
                      <span>Orders</span>
                    </Link>
                  </li>

                  {/* Notifications */}
                  <li className="nav-item">
                    <div className="notifications-container">
                      <button
                        className="notifications-trigger"
                        onClick={() => setShowNotifications(!showNotifications)}
                      >
                        <Bell size={20} />
                        <span className="notification-badge">3</span>
                      </button>
                    </div>
                  </li>

                  <li className="nav-item dropdown">
                    <div className="user-menu">
                      <button className="user-menu-trigger" onClick={() => setShowUserMenu(!showUserMenu)}>
                        <div className="user-avatar">{user.first_name.charAt(0).toUpperCase()}</div>
                        <span className="user-name">Hi, {user.first_name}</span>
                      </button>

                      {showUserMenu && (
                        <div className="user-dropdown">
                          <Link to="/profile" className="dropdown-item" onClick={() => setShowUserMenu(false)}>
                            <Settings size={16} className="dropdown-icon" />
                            <span>My Profile</span>
                          </Link>
                          <Link to="/transactions" className="dropdown-item" onClick={() => setShowUserMenu(false)}>
                            <ShoppingCart size={16} className="dropdown-icon" />
                            <span>Order History</span>
                          </Link>
                          <div className="dropdown-divider"></div>
                          <button onClick={handleLogout} className="dropdown-item logout-btn">
                            <LogOut size={16} className="dropdown-icon" />
                            <span>Sign Out</span>
                          </button>
                        </div>
                      )}
                    </div>
                  </li>
                </>
              ) : (
                <>
                  <li className="nav-item">
                    <Link to="/login" className="nav-link">
                      <User size={18} />
                      <span>Sign In</span>
                    </Link>
                  </li>
                  <li className="nav-item">
                    <Link to="/register" className="btn btn-primary btn-small">
                      Join Free
                    </Link>
                  </li>
                </>
              )}
            </ul>
          </div>

          {/* Mobile Menu Button */}
          <button className="mobile-menu-btn" onClick={toggleMenu}>
            <span className="hamburger-icon">{isMenuOpen ? "✕" : "☰"}</span>
          </button>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="mobile-nav">
            <Link
              to="/"
              className={`mobile-nav-link ${isActive("/") ? "mobile-nav-link-active" : ""}`}
              onClick={() => setIsMenuOpen(false)}
            >
              <Home size={18} className="nav-icon" />
              <span>Home</span>
            </Link>
            <Link
              to="/deals"
              className={`mobile-nav-link ${isActive("/deals") ? "mobile-nav-link-active" : ""}`}
              onClick={() => setIsMenuOpen(false)}
            >
              <ShoppingBag size={18} className="nav-icon" />
              <span>Deals</span>
            </Link>

            {user ? (
              <>
                <Link
                  to="/transactions"
                  className={`mobile-nav-link ${isActive("/transactions") ? "mobile-nav-link-active" : ""}`}
                  onClick={() => setIsMenuOpen(false)}
                >
                  <ShoppingCart size={18} className="nav-icon" />
                  <span>My Orders</span>
                </Link>
                <Link
                  to="/profile"
                  className={`mobile-nav-link ${isActive("/profile") ? "mobile-nav-link-active" : ""}`}
                  onClick={() => setIsMenuOpen(false)}
                >
                  <Settings size={18} className="nav-icon" />
                  <span>My Profile</span>
                </Link>
                <button onClick={handleLogout} className="mobile-nav-link logout-btn">
                  <LogOut size={18} className="nav-icon" />
                  <span>Sign Out</span>
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="mobile-nav-link" onClick={() => setIsMenuOpen(false)}>
                  <User size={18} className="nav-icon" />
                  <span>Sign In</span>
                </Link>
                <Link to="/register" className="mobile-nav-link mobile-signup" onClick={() => setIsMenuOpen(false)}>
                  <span>Join Free</span>
                </Link>
              </>
            )}
          </div>
        )}
      </div>
    </nav>
  )
}

export default Navbar
