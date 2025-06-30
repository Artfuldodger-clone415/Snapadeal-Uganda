"use client"
import type React from "react"
import { useState, useEffect, useCallback } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { useAuth } from "../contexts/AuthContext"
import { api } from "../services/api"
import toast from "react-hot-toast"
import ProtectedRoute from "../components/ProtectedRoute"
import { MapPin, Clock, Users, Star, Shield, ArrowLeft, Share2, Heart } from "lucide-react"

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
  fine_prints: string
  max_quantity: number
  sold_quantity: number
  start_date: string
  end_date: string
  category: {
    name: string
  }
  merchant: {
    first_name: string
    last_name: string
  }
}

const DealDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>()
  const { user } = useAuth()
  const navigate = useNavigate()
  const [deal, setDeal] = useState<Deal | null>(null)
  const [loading, setLoading] = useState(true)
  const [purchasing, setPurchasing] = useState(false)
  const [quantity, setQuantity] = useState(1)
  const [paymentMethod, setPaymentMethod] = useState("mtn_money")
  const [phoneNumber, setPhoneNumber] = useState("")
  const [selectedImageIndex, setSelectedImageIndex] = useState(0)

  const fetchDeal = useCallback(async () => {
    try {
      const response = await api.get(`/deals/${id}`)
      setDeal(response.data.deal)
    } catch (error: any) {
      console.error("❌ Failed to fetch deal:", error)
      toast.error("Deal not found")
      navigate("/deals")
    } finally {
      setLoading(false)
    }
  }, [id, navigate])

  useEffect(() => {
    if (id) {
      fetchDeal()
    }
  }, [id, fetchDeal])

  const handlePurchase = async () => {
    if (!user) {
      toast.error("Please login to purchase deals")
      navigate("/login")
      return
    }

    if (!phoneNumber) {
      toast.error("Please enter your phone number")
      return
    }

    const phoneRegex = /^(\+256|0)[0-9]{9}$/
    if (!phoneRegex.test(phoneNumber)) {
      toast.error("Please enter a valid Ugandan phone number")
      return
    }

    if (!deal) {
      toast.error("Deal not found")
      return
    }

    setPurchasing(true)
    try {
      const transactionData = {
        deal_id: deal.id,
        quantity: quantity,
        payment_method: paymentMethod,
        phone_number: phoneNumber,
      }

      const response = await api.post("/transactions", transactionData)
      const { payment_url } = response.data

      if (!payment_url) {
        toast.error("Payment URL not received")
        return
      }

      toast.success("Transaction created! Redirecting to payment...")
      setTimeout(() => {
        window.location.href = payment_url
      }, 1000)
    } catch (error: any) {
      let errorMessage = "Purchase failed"
      if (error.response?.data?.error) {
        errorMessage = error.response.data.error
      }
      toast.error(errorMessage)
    } finally {
      setPurchasing(false)
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
      month: "long",
      day: "numeric",
    })
  }

  const isExpired = () => {
    return deal ? new Date() > new Date(deal.end_date) : false
  }

  const isAvailable = () => {
    return deal ? deal.sold_quantity < deal.max_quantity && !isExpired() : false
  }

  const getImageUrl = (imageUrl: string) => {
    if (!imageUrl) return "/placeholder.svg?height=400&width=600"

    if (imageUrl.startsWith("http://") || imageUrl.startsWith("https://")) {
      return imageUrl
    }

    if (imageUrl.startsWith("/uploads/")) {
      return `http://localhost:8080${imageUrl}`
    }

    if (!imageUrl.includes("/")) {
      return `http://localhost:8080/uploads/images/${imageUrl}`
    }

    return imageUrl
  }

  const allImages = deal ? [deal.image_url, ...(deal.images || [])].filter(Boolean) : []

  if (loading) {
    return (
      <div className="container" style={{ marginTop: "3rem", textAlign: "center" }}>
        <div className="spinner-large"></div>
        <p>Loading deal details...</p>
      </div>
    )
  }

  if (!deal) {
    return (
      <div className="container text-center" style={{ marginTop: "3rem" }}>
        <h2>Deal not found</h2>
        <button onClick={() => navigate("/deals")} className="btn btn-primary">
          Browse Deals
        </button>
      </div>
    )
  }

  const daysRemaining = Math.ceil((new Date(deal.end_date).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))
  const soldPercentage = (deal.sold_quantity / deal.max_quantity) * 100

  return (
    <ProtectedRoute>
      <div className="container" style={{ marginTop: "2rem" }}>
        {/* Back Button */}
        <div style={{ marginBottom: "1.5rem" }}>
          <button
            onClick={() => navigate("/deals")}
            className="btn btn-outline"
            style={{ display: "flex", alignItems: "center", gap: "8px" }}
          >
            <ArrowLeft size={16} />
            Back to Deals
          </button>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: "2rem" }}>
          {/* Main Content */}
          <div>
            {/* Image Gallery */}
            <div className="card" style={{ marginBottom: "1.5rem" }}>
              <div style={{ position: "relative" }}>
                <img
                  src={getImageUrl(allImages[selectedImageIndex] || deal.image_url)}
                  alt={deal.title}
                  style={{
                    width: "100%",
                    height: "400px",
                    objectFit: "cover",
                    borderRadius: "12px 12px 0 0",
                  }}
                  onError={(e) => {
                    e.currentTarget.src = "/placeholder.svg?height=400&width=600"
                  }}
                />

                {/* Discount Badge */}
                <div
                  style={{
                    position: "absolute",
                    top: "20px",
                    left: "20px",
                    background: "linear-gradient(135deg, #ff6b6b 0%, #ee5a24 100%)",
                    color: "white",
                    padding: "8px 16px",
                    borderRadius: "25px",
                    fontWeight: "700",
                    fontSize: "16px",
                    boxShadow: "var(--shadow-medium)",
                  }}
                >
                  {deal.discount_percent}% OFF
                </div>

                {/* Urgency Badge */}
                {daysRemaining <= 3 && daysRemaining > 0 && (
                  <div
                    style={{
                      position: "absolute",
                      top: "20px",
                      right: "20px",
                      background: "rgba(0, 0, 0, 0.8)",
                      color: "white",
                      padding: "8px 12px",
                      borderRadius: "20px",
                      fontSize: "12px",
                      fontWeight: "600",
                      display: "flex",
                      alignItems: "center",
                      gap: "4px",
                    }}
                  >
                    <Clock size={14} />
                    {daysRemaining} day{daysRemaining !== 1 ? "s" : ""} left
                  </div>
                )}

                {/* Action Buttons */}
                <div
                  style={{
                    position: "absolute",
                    bottom: "20px",
                    right: "20px",
                    display: "flex",
                    gap: "8px",
                  }}
                >
                  <button
                    className="btn btn-outline"
                    style={{
                      background: "rgba(255, 255, 255, 0.9)",
                      border: "none",
                      padding: "8px",
                      borderRadius: "50%",
                    }}
                  >
                    <Heart size={16} />
                  </button>
                  <button
                    className="btn btn-outline"
                    style={{
                      background: "rgba(255, 255, 255, 0.9)",
                      border: "none",
                      padding: "8px",
                      borderRadius: "50%",
                    }}
                  >
                    <Share2 size={16} />
                  </button>
                </div>
              </div>

              {/* Image Thumbnails */}
              {allImages.length > 1 && (
                <div
                  style={{
                    padding: "1rem",
                    display: "flex",
                    gap: "8px",
                    overflowX: "auto",
                  }}
                >
                  {allImages.map((image, index) => (
                    <img
                      key={index}
                      src={getImageUrl(image) || "/placeholder.svg"}
                      alt={`${deal.title} ${index + 1}`}
                      style={{
                        width: "80px",
                        height: "60px",
                        objectFit: "cover",
                        borderRadius: "6px",
                        cursor: "pointer",
                        border:
                          selectedImageIndex === index ? "2px solid var(--primary-green)" : "2px solid transparent",
                        transition: "all 0.3s ease",
                      }}
                      onClick={() => setSelectedImageIndex(index)}
                      onError={(e) => {
                        e.currentTarget.style.display = "none"
                      }}
                    />
                  ))}
                </div>
              )}
            </div>

            {/* Deal Information */}
            <div className="card">
              <div className="card-body">
                {/* Header */}
                <div style={{ marginBottom: "1.5rem" }}>
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "flex-start",
                      marginBottom: "1rem",
                    }}
                  >
                    <div style={{ flex: 1 }}>
                      <div
                        style={{
                          fontSize: "12px",
                          color: "var(--primary-green)",
                          fontWeight: "700",
                          textTransform: "uppercase",
                          letterSpacing: "1px",
                          marginBottom: "0.5rem",
                        }}
                      >
                        {deal.category.name}
                      </div>
                      <h1
                        style={{
                          fontSize: "2rem",
                          fontWeight: "800",
                          color: "var(--text-dark)",
                          marginBottom: "0.5rem",
                          lineHeight: "1.2",
                        }}
                      >
                        {deal.title}
                      </h1>
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "1rem",
                          color: "var(--text-medium)",
                          fontSize: "14px",
                        }}
                      >
                        <span>
                          by {deal.merchant.first_name} {deal.merchant.last_name}
                        </span>
                        <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                          <Star size={14} fill="currentColor" style={{ color: "var(--warning)" }} />
                          <span>4.5 (127 reviews)</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Pricing */}
                  <div
                    style={{
                      display: "flex",
                      alignItems: "baseline",
                      gap: "1rem",
                      marginBottom: "1rem",
                    }}
                  >
                    <span
                      style={{
                        fontSize: "2.5rem",
                        fontWeight: "800",
                        color: "var(--primary-green)",
                      }}
                    >
                      {formatPrice(deal.discount_price)}
                    </span>
                    <span
                      style={{
                        fontSize: "1.25rem",
                        color: "var(--text-light)",
                        textDecoration: "line-through",
                      }}
                    >
                      {formatPrice(deal.original_price)}
                    </span>
                    <span
                      style={{
                        fontSize: "14px",
                        color: "var(--error)",
                        fontWeight: "600",
                      }}
                    >
                      You save {formatPrice(deal.original_price - deal.discount_price)}
                    </span>
                  </div>

                  {/* Progress Bar */}
                  <div style={{ marginBottom: "1.5rem" }}>
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        marginBottom: "8px",
                      }}
                    >
                      <span style={{ fontSize: "14px", fontWeight: "600", color: "var(--text-dark)" }}>
                        {deal.sold_quantity} bought
                      </span>
                      <span style={{ fontSize: "12px", color: "var(--text-light)" }}>
                        {deal.max_quantity - deal.sold_quantity} remaining
                      </span>
                    </div>
                    <div
                      style={{
                        width: "100%",
                        height: "8px",
                        background: "var(--border-light)",
                        borderRadius: "4px",
                        overflow: "hidden",
                      }}
                    >
                      <div
                        style={{
                          width: `${soldPercentage}%`,
                          height: "100%",
                          background:
                            "linear-gradient(90deg, var(--primary-green) 0%, var(--primary-green-light) 100%)",
                          transition: "width 0.3s ease",
                        }}
                      ></div>
                    </div>
                  </div>
                </div>

                {/* Description */}
                <div style={{ marginBottom: "2rem" }}>
                  <h3 style={{ marginBottom: "1rem" }}>About This Deal</h3>
                  <p
                    style={{
                      fontSize: "16px",
                      lineHeight: "1.6",
                      color: "var(--text-medium)",
                    }}
                  >
                    {deal.description}
                  </p>
                </div>

                {/* Deal Details */}
                <div style={{ marginBottom: "2rem" }}>
                  <h4 style={{ marginBottom: "1rem" }}>Deal Details</h4>
                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
                      gap: "1rem",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "8px",
                        padding: "12px",
                        background: "var(--background-light)",
                        borderRadius: "8px",
                      }}
                    >
                      <MapPin size={16} style={{ color: "var(--primary-green)" }} />
                      <div>
                        <div style={{ fontSize: "12px", color: "var(--text-light)" }}>Location</div>
                        <div style={{ fontWeight: "600" }}>{deal.location}</div>
                      </div>
                    </div>

                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "8px",
                        padding: "12px",
                        background: "var(--background-light)",
                        borderRadius: "8px",
                      }}
                    >
                      <Clock size={16} style={{ color: "var(--primary-green)" }} />
                      <div>
                        <div style={{ fontSize: "12px", color: "var(--text-light)" }}>Valid Until</div>
                        <div style={{ fontWeight: "600" }}>{formatDate(deal.end_date)}</div>
                      </div>
                    </div>

                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "8px",
                        padding: "12px",
                        background: "var(--background-light)",
                        borderRadius: "8px",
                      }}
                    >
                      <Users size={16} style={{ color: "var(--primary-green)" }} />
                      <div>
                        <div style={{ fontSize: "12px", color: "var(--text-light)" }}>Available</div>
                        <div style={{ fontWeight: "600" }}>
                          {deal.max_quantity - deal.sold_quantity} of {deal.max_quantity}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Fine Prints */}
                {deal.fine_prints && (
                  <div style={{ marginBottom: "2rem" }}>
                    <h4 style={{ marginBottom: "1rem" }}>Terms & Conditions</h4>
                    <div
                      style={{
                        background: "var(--background-light)",
                        padding: "1rem",
                        borderRadius: "8px",
                        fontSize: "14px",
                        color: "var(--text-medium)",
                        lineHeight: "1.5",
                      }}
                    >
                      {deal.fine_prints}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Purchase Sidebar */}
          </div>

          <div>
            <div className="card" style={{ position: "sticky", top: "100px" }}>
              <div className="card-header">
                <h4 style={{ margin: 0 }}>Purchase This Deal</h4>
              </div>
              <div className="card-body">
                {isExpired() ? (
                  <div style={{ textAlign: "center", padding: "2rem" }}>
                    <Clock size={48} style={{ color: "var(--error)", marginBottom: "1rem" }} />
                    <h4 style={{ color: "var(--error)" }}>Deal Expired</h4>
                    <p style={{ color: "var(--text-medium)" }}>This deal is no longer available</p>
                  </div>
                ) : !isAvailable() ? (
                  <div style={{ textAlign: "center", padding: "2rem" }}>
                    <Users size={48} style={{ color: "var(--error)", marginBottom: "1rem" }} />
                    <h4 style={{ color: "var(--error)" }}>Sold Out</h4>
                    <p style={{ color: "var(--text-medium)" }}>This deal is no longer available</p>
                  </div>
                ) : (
                  <>
                    <div className="form-group">
                      <label className="form-label">Quantity</label>
                      <select
                        value={quantity}
                        onChange={(e) => setQuantity(Number(e.target.value))}
                        className="form-control"
                      >
                        {[...Array(Math.min(5, deal.max_quantity - deal.sold_quantity))].map((_, i) => (
                          <option key={i + 1} value={i + 1}>
                            {i + 1} {i + 1 === 1 ? "voucher" : "vouchers"}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="form-group">
                      <label className="form-label">Payment Method</label>
                      <select
                        value={paymentMethod}
                        onChange={(e) => setPaymentMethod(e.target.value)}
                        className="form-control"
                      >
                        <option value="mtn_money">MTN Mobile Money</option>
                        <option value="airtel_money">Airtel Money</option>
                      </select>
                    </div>

                    <div className="form-group">
                      <label className="form-label">Phone Number</label>
                      <input
                        type="tel"
                        value={phoneNumber}
                        onChange={(e) => setPhoneNumber(e.target.value)}
                        placeholder="+256700000000 or 0700000000"
                        className="form-control"
                        required
                      />
                      <small style={{ color: "var(--text-light)", fontSize: "12px" }}>
                        Enter your {paymentMethod === "mtn_money" ? "MTN" : "Airtel"} number for payment
                      </small>
                    </div>

                    {/* Price Summary */}
                    <div
                      style={{
                        background: "var(--background-light)",
                        padding: "1rem",
                        borderRadius: "8px",
                        marginBottom: "1.5rem",
                      }}
                    >
                      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px" }}>
                        <span>Price per voucher:</span>
                        <span>{formatPrice(deal.discount_price)}</span>
                      </div>
                      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px" }}>
                        <span>Quantity:</span>
                        <span>{quantity}</span>
                      </div>
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          fontWeight: "700",
                          fontSize: "1.1rem",
                          paddingTop: "8px",
                          borderTop: "1px solid var(--border-light)",
                        }}
                      >
                        <span>Total:</span>
                        <span style={{ color: "var(--primary-green)" }}>
                          {formatPrice(deal.discount_price * quantity)}
                        </span>
                      </div>
                    </div>

                    <button
                      onClick={handlePurchase}
                      disabled={purchasing || !user}
                      className="btn btn-primary btn-large"
                      style={{ width: "100%", marginBottom: "1rem" }}
                    >
                      {purchasing ? "Processing..." : user ? "Buy Now" : "Login to Purchase"}
                    </button>

                    {!user && (
                      <button onClick={() => navigate("/login")} className="btn btn-outline" style={{ width: "100%" }}>
                        Login to Purchase
                      </button>
                    )}

                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: "8px",
                        marginTop: "1rem",
                        fontSize: "12px",
                        color: "var(--text-light)",
                      }}
                    >
                      <Shield size={14} />
                      <span>Secure payment powered by Flutterwave</span>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  )
}

export default DealDetail
