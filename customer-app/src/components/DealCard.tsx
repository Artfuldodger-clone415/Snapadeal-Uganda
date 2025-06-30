"use client"
import type React from "react"
import { Link } from "react-router-dom"
import { MapPin, Clock, Users, Star } from "lucide-react"

interface Deal {
  id: number
  title: string
  description: string
  short_description: string
  original_price: number
  discount_price: number
  discount_percent: number
  image_url: string
  location: string
  category: {
    name: string
  }
  merchant: {
    first_name: string
    last_name: string
  }
  end_date: string
  sold_quantity?: number
  max_quantity: number
}

interface DealCardProps {
  deal: Deal
}

const DealCard: React.FC<DealCardProps> = ({ deal }) => {
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("en-UG", {
      style: "currency",
      currency: "UGX",
      minimumFractionDigits: 0,
    }).format(price)
  }

  const savings = deal.original_price - deal.discount_price
  const soldPercentage = deal.sold_quantity ? (deal.sold_quantity / deal.max_quantity) * 100 : 0

  // Calculate days remaining
  const daysRemaining = Math.ceil((new Date(deal.end_date).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))

  // FIXED: Proper image URL handling
  const getImageUrl = (imageUrl: string) => {
    if (!imageUrl) return "/placeholder.svg?height=240&width=400"

    // If it's already a full URL, return as is
    if (imageUrl.startsWith("http://") || imageUrl.startsWith("https://")) {
      return imageUrl
    }

    // If it starts with /uploads/, prepend backend URL
    if (imageUrl.startsWith("/uploads/")) {
      return `http://localhost:8080${imageUrl}`
    }

    // If it's just a filename, assume it's in uploads/images
    if (!imageUrl.includes("/")) {
      return `http://localhost:8080/uploads/images/${imageUrl}`
    }

    // Default case
    return `http://localhost:8080${imageUrl}`
  }

  return (
    <Link to={`/deals/${deal.id}`} className="deal-card-link">
      <div className="deal-card">
        <div className="deal-image-container">
          <img
            src={getImageUrl(deal.image_url) || "/placeholder.svg"}
            alt={deal.title}
            className="deal-image"
            onError={(e) => {
              console.log("Image failed to load:", deal.image_url)
              e.currentTarget.src = "/placeholder.svg?height=240&width=400"
            }}
            onLoad={() => {
              console.log("Image loaded successfully:", deal.image_url)
            }}
          />

          {/* Discount Badge */}
          <div className="deal-discount-badge">
            <span className="discount-percent">{deal.discount_percent}%</span>
            <span className="discount-text">OFF</span>
          </div>

          {/* Urgency Badge */}
          {daysRemaining <= 3 && daysRemaining > 0 && (
            <div className="deal-urgency-badge">
              <Clock size={12} />
              <span>
                {daysRemaining} day{daysRemaining !== 1 ? "s" : ""} left
              </span>
            </div>
          )}
        </div>

        <div className="deal-content">
          {/* Category */}
          <div className="deal-category">{deal.category.name}</div>

          {/* Title */}
          <h3 className="deal-title">{deal.title}</h3>

          {/* Description */}
          <p className="deal-description">{deal.short_description || deal.description}</p>

          {/* Location */}
          <div className="deal-location">
            <MapPin size={14} />
            <span>{deal.location}</span>
          </div>

          {/* Pricing Section */}
          <div className="deal-pricing">
            <div className="deal-price-row">
              <span className="deal-price-current">{formatPrice(deal.discount_price)}</span>
              <span className="deal-price-original">{formatPrice(deal.original_price)}</span>
            </div>
            <div className="deal-savings">You save {formatPrice(savings)}</div>
          </div>

          {/* Progress Bar (if sold quantity available) */}
          {deal.sold_quantity !== undefined && (
            <div className="deal-progress">
              <div className="deal-progress-bar">
                <div className="deal-progress-fill" style={{ width: `${Math.min(soldPercentage, 100)}%` }}></div>
              </div>
              <div className="deal-progress-text">
                <Users size={12} />
                <span>{deal.sold_quantity} bought</span>
              </div>
            </div>
          )}

          {/* Merchant Info */}
          <div className="deal-merchant">
            <div className="deal-merchant-info">
              <span>
                by {deal.merchant.first_name} {deal.merchant.last_name}
              </span>
            </div>
            <div className="deal-rating">
              <Star size={12} fill="currentColor" />
              <span>4.5</span>
            </div>
          </div>
        </div>
      </div>
    </Link>
  )
}

export default DealCard
