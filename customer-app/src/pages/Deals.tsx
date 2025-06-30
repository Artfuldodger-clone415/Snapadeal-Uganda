"use client"
import type React from "react"
import { useState, useEffect, useCallback } from "react"
import { useSearchParams } from "react-router-dom"
import { api } from "../services/api"
import DealCard from "../components/DealCard"
import ProtectedRoute from "../components/ProtectedRoute"
import { Filter, MapPin, Search } from "lucide-react"

interface Deal {
  id: number
  title: string
  description: string
  short_description: string
  original_price: number
  discount_price: number
  discount_percent: number
  image_url: string
  images: string[]
  location: string
  start_date: string
  end_date: string
  max_quantity: number
  sold_quantity: number
  status: string
  is_active: boolean
  created_at: string
  updated_at: string
  category: {
    id: number
    name: string
  }
  merchant: {
    first_name: string
    last_name: string
  }
}

interface Category {
  id: number
  name: string
  description: string
  icon_url: string
}

const Deals: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams()
  const [deals, setDeals] = useState<Deal[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState("")

  // Get current filters from URL
  const categoryId = searchParams.get("category_id")
  const location = searchParams.get("location")
  const searchFromUrl = searchParams.get("search")

  useEffect(() => {
    if (searchFromUrl) {
      setSearchQuery(searchFromUrl)
    }
  }, [searchFromUrl])

  const fetchDeals = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)

      let url = "/deals"
      const params = new URLSearchParams()

      if (categoryId) params.append("category_id", categoryId)
      if (location) params.append("location", location)
      if (searchFromUrl) {
        url = `/deals/search?q=${encodeURIComponent(searchFromUrl)}`
      } else if (params.toString()) {
        url = `/deals?${params.toString()}`
      }

      const response = await api.get(url)
      const fetchedDeals = response.data.deals || []
      setDeals(fetchedDeals)
    } catch (error: any) {
      console.error("❌ Failed to fetch deals:", error)
      setError(error.response?.data?.error || error.message || "Failed to load deals")
    } finally {
      setLoading(false)
    }
  }, [categoryId, location, searchFromUrl])

  useEffect(() => {
    fetchDeals()
    fetchCategories()
  }, [fetchDeals])

  const fetchCategories = async () => {
    try {
      const response = await api.get("/categories")
      const fetchedCategories = response.data.categories || []
      setCategories(fetchedCategories)
    } catch (error) {
      console.error("❌ Failed to fetch categories:", error)
    }
  }

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!searchQuery.trim()) return

    const newParams = new URLSearchParams()
    newParams.set("search", searchQuery)
    setSearchParams(newParams)
  }

  const handleFilterChange = (key: string, value: string) => {
    const newParams = new URLSearchParams(searchParams)
    if (value) {
      newParams.set(key, value)
    } else {
      newParams.delete(key)
    }
    newParams.delete("search") // Clear search when filtering
    setSearchParams(newParams)
  }

  const clearFilters = () => {
    setSearchParams({})
    setSearchQuery("")
  }

  const selectedCategory = categories.find((cat) => cat.id.toString() === categoryId)

  if (loading && deals.length === 0) {
    return (
      <div className="container" style={{ marginTop: "3rem", textAlign: "center" }}>
        <div className="spinner-large"></div>
        <p>Loading amazing deals...</p>
      </div>
    )
  }

  return (
    <ProtectedRoute>
      <div className="deals-page">
        {/* Coming Soon Advertising Section */}
        <section className="coming-soon-section">
          <div className="container">
            <div className="coming-soon-content">
              <h2>🚀 Advertising Space Coming Soon!</h2>
              <p>
                Premium advertising spots will be available here for businesses to showcase their special offers.
                Contact us to reserve your space and reach thousands of deal-hungry customers!
              </p>
            </div>
          </div>
        </section>

        <div className="container" style={{ marginTop: "2rem" }}>
          {/* Page Header */}
          <div className="section-header">
            <h1>
              {selectedCategory
                ? `${selectedCategory.name} Deals`
                : searchFromUrl
                  ? `Search Results for "${searchFromUrl}"`
                  : "All Deals"}
            </h1>
            <p>
              {selectedCategory
                ? selectedCategory.description
                : searchFromUrl
                  ? `Found ${deals.length} deals matching your search`
                  : "Discover amazing deals from local businesses across Uganda"}
            </p>
          </div>

          {/* Search and Filters */}
          <div
            className="deals-controls"
            style={{
              display: "flex",
              gap: "1rem",
              marginBottom: "2rem",
              flexWrap: "wrap",
              alignItems: "center",
              background: "var(--background-white)",
              padding: "1.5rem",
              borderRadius: "12px",
              boxShadow: "var(--shadow-light)",
            }}
          >
            <form onSubmit={handleSearch} style={{ display: "flex", gap: "0.5rem", flex: "1", minWidth: "300px" }}>
              <div style={{ position: "relative", flex: "1" }}>
                <Search
                  size={16}
                  style={{
                    position: "absolute",
                    left: "12px",
                    top: "50%",
                    transform: "translateY(-50%)",
                    color: "var(--text-light)",
                  }}
                />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search deals, restaurants, activities..."
                  className="form-control"
                  style={{ paddingLeft: "40px" }}
                />
              </div>
              <button type="submit" className="btn btn-primary">
                Search
              </button>
            </form>

            <div style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
              <Filter size={16} style={{ color: "var(--text-medium)" }} />
              <select
                value={categoryId || ""}
                onChange={(e) => handleFilterChange("category_id", e.target.value)}
                className="form-control"
                style={{ minWidth: "150px" }}
              >
                <option value="">All Categories</option>
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>

              <div style={{ position: "relative" }}>
                <MapPin
                  size={16}
                  style={{
                    position: "absolute",
                    left: "12px",
                    top: "50%",
                    transform: "translateY(-50%)",
                    color: "var(--text-light)",
                  }}
                />
                <input
                  type="text"
                  value={location || ""}
                  onChange={(e) => handleFilterChange("location", e.target.value)}
                  placeholder="Location..."
                  className="form-control"
                  style={{ paddingLeft: "40px", minWidth: "150px" }}
                />
              </div>

              {(categoryId || location || searchFromUrl) && (
                <button onClick={clearFilters} className="btn btn-outline">
                  Clear All
                </button>
              )}
            </div>
          </div>

          {/* Error State */}
          {error && (
            <div className="error-container">
              <div className="error-content">
                <h3>Oops! Something went wrong</h3>
                <p>{error}</p>
                <button onClick={fetchDeals} className="btn btn-primary">
                  Try Again
                </button>
              </div>
            </div>
          )}

          {/* Deals Grid */}
          {!error && (
            <>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: "1.5rem",
                  padding: "1rem 0",
                  borderBottom: "1px solid var(--border-light)",
                }}
              >
                <h3 style={{ margin: 0, color: "var(--text-dark)" }}>
                  {deals.length} {deals.length === 1 ? "Deal" : "Deals"} Found
                </h3>
                {loading && <div className="spinner-large"></div>}
              </div>

              {deals.length > 0 ? (
                <div className="deals-grid">
                  {deals.map((deal) => (
                    <DealCard key={deal.id} deal={deal} />
                  ))}
                </div>
              ) : !loading ? (
                <div className="no-deals">
                  <h3>No deals found</h3>
                  <p>
                    {searchFromUrl || categoryId || location
                      ? "Try adjusting your search or filters to find more deals"
                      : "Check back soon for amazing new deals!"}
                  </p>
                  {(searchFromUrl || categoryId || location) && (
                    <button onClick={clearFilters} className="btn btn-primary">
                      View All Deals
                    </button>
                  )}
                </div>
              ) : null}
            </>
          )}
        </div>
      </div>
    </ProtectedRoute>
  )
}

export default Deals
