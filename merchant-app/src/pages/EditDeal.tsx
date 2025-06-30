"use client"

import type React from "react"
import { useState, useEffect, useRef } from "react"
import { useParams, useNavigate } from "react-router-dom"
import {
  ArrowLeft,
  Upload,
  X,
  Save,
  AlertTriangle,
  DollarSign,
  Tag,
  FileText,
  Calendar,
  MapPin,
  ImageIcon,
} from "lucide-react"
import { api } from "../services/api"
import toast from "react-hot-toast"
import ImageUpload from "../components/ImageUpload"

interface Category {
  id: number
  name: string
}

interface Deal {
  id: number
  title: string
  description: string
  short_description: string
  original_price: number
  discount_price: number
  category_id: number
  start_date: string
  end_date: string
  max_quantity: number
  location: string
  fine_prints: string
  image_url: string
  images: string[]
  status: string
}

const EditDeal: React.FC = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [loading, setLoading] = useState(false)
  const [fetchLoading, setFetchLoading] = useState(true)
  const [categories, setCategories] = useState<Category[]>([])
  const [deal, setDeal] = useState<Deal | null>(null)
  const [images, setImages] = useState<string[]>([])
  const [mainImage, setMainImage] = useState<File | null>(null)
  const [mainImagePreview, setMainImagePreview] = useState<string>("")

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    short_description: "",
    original_price: "",
    discount_price: "",
    category_id: "",
    start_date: "",
    end_date: "",
    max_quantity: "",
    location: "",
    fine_prints: "",
    image_url: "",
  })

  useEffect(() => {
    if (id) {
      fetchDeal()
      fetchCategories()
    }
  }, [id])

  const fetchDeal = async () => {
    try {
      const response = await api.get(`/deals/${id}`)
      const dealData = response.data.deal
      setDeal(dealData)
      setImages(dealData.images || [])
      setMainImagePreview(dealData.image_url || "")

      setFormData({
        title: dealData.title,
        description: dealData.description,
        short_description: dealData.short_description,
        original_price: dealData.original_price.toString(),
        discount_price: dealData.discount_price.toString(),
        category_id: dealData.category_id.toString(),
        start_date: dealData.start_date.split("T")[0],
        end_date: dealData.end_date.split("T")[0],
        max_quantity: dealData.max_quantity.toString(),
        location: dealData.location,
        fine_prints: dealData.fine_prints || "",
        image_url: dealData.image_url || "",
      })
    } catch (error) {
      console.error("Failed to fetch deal:", error)
      toast.error("Deal not found")
      navigate("/deals")
    } finally {
      setFetchLoading(false)
    }
  }

  const fetchCategories = async () => {
    try {
      const response = await api.get("/categories")
      setCategories(response.data.categories || [])
    } catch (error) {
      console.error("Failed to fetch categories:", error)
      toast.error("Failed to load categories")
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleMainImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setMainImage(file)
      const reader = new FileReader()
      reader.onload = (e) => {
        setMainImagePreview(e.target?.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const removeMainImage = () => {
    setMainImage(null)
    setMainImagePreview("")
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // Validation
    if (Number(formData.discount_price) >= Number(formData.original_price)) {
      toast.error("Discount price must be less than original price")
      return
    }

    if (new Date(formData.end_date) <= new Date(formData.start_date)) {
      toast.error("End date must be after start date")
      return
    }

    setLoading(true)

    try {
      const dealFormData = new FormData()

      // Add form fields
      Object.entries(formData).forEach(([key, value]) => {
        if (key === "original_price" || key === "discount_price" || key === "category_id" || key === "max_quantity") {
          dealFormData.append(key, Number(value).toString())
        } else if (key === "start_date" || key === "end_date") {
          dealFormData.append(key, new Date(value).toISOString())
        } else {
          dealFormData.append(key, value)
        }
      })

      // Add main image if selected
      if (mainImage) {
        dealFormData.append("main_image", mainImage)
      }

      // Add additional images
      dealFormData.append("images", JSON.stringify(images))

      await api.put(`/deals/${id}`, dealFormData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      })

      toast.success("Deal updated successfully! Changes are pending admin approval.")
      navigate("/deals")
    } catch (error: any) {
      toast.error(error.response?.data?.error || "Failed to update deal")
    } finally {
      setLoading(false)
    }
  }

  const calculateDiscount = () => {
    const original = Number(formData.original_price)
    const discount = Number(formData.discount_price)
    if (original > 0 && discount > 0 && discount < original) {
      return Math.round(((original - discount) / original) * 100)
    }
    return 0
  }

  if (fetchLoading) {
    return (
      <div className="dashboard-loading">
        <div className="spinner-large"></div>
        <p>Loading deal...</p>
      </div>
    )
  }

  if (!deal) {
    return (
      <div className="empty-state">
        <h2>Deal not found</h2>
        <button onClick={() => navigate("/deals")} className="btn btn-primary">
          Back to Deals
        </button>
      </div>
    )
  }

  return (
    <div className="edit-deal-page">
      {/* Header */}
      <div className="edit-deal-header">
        <button onClick={() => navigate("/deals")} className="btn-back-enhanced">
          <ArrowLeft size={16} />
          <span>Back to Deals</span>
        </button>
        <div>
          <h1>Edit Deal</h1>
          <p>Update your deal information and settings</p>
        </div>
      </div>

      {/* Status Warning */}
      {deal.status === "approved" && (
        <div className="status-warning-card">
          <AlertTriangle size={20} className="warning-icon" />
          <div className="warning-content">
            <h5>Deal is Currently Live</h5>
            <p>
              This deal is currently approved and visible to customers. Any changes will require admin approval again.
            </p>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="edit-form-layout">
          {/* Main Form */}
          <div className="edit-form-main">
            {/* Basic Information */}
            <div className="edit-form-section">
              <div className="edit-section-header">
                <FileText className="edit-section-icon" />
                <h3>Deal Information</h3>
              </div>

              <div className="edit-form-grid">
                <div className="edit-form-group full-width">
                  <label className="edit-form-label">
                    <Tag size={16} />
                    Deal Title *
                  </label>
                  <input
                    type="text"
                    name="title"
                    value={formData.title}
                    onChange={handleChange}
                    className="edit-form-control"
                    placeholder="Enter an attractive deal title"
                    required
                  />
                </div>

                <div className="edit-form-group full-width">
                  <label className="edit-form-label">
                    <FileText size={16} />
                    Short Description *
                  </label>
                  <input
                    type="text"
                    name="short_description"
                    value={formData.short_description}
                    onChange={handleChange}
                    className="edit-form-control"
                    placeholder="Brief description for deal cards"
                    maxLength={100}
                    required
                  />
                  <small className="character-count">{formData.short_description.length}/100 characters</small>
                </div>

                <div className="edit-form-group full-width">
                  <label className="edit-form-label">
                    <FileText size={16} />
                    Full Description *
                  </label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    className="edit-form-control edit-textarea"
                    rows={5}
                    placeholder="Detailed description of your deal"
                    required
                  />
                </div>
              </div>
            </div>

            {/* Enhanced Pricing Section */}
            <div className="edit-form-section">
              <div className="edit-section-header">
                <DollarSign className="edit-section-icon" />
                <h3>Pricing Details</h3>
              </div>

              <div className="edit-pricing-grid">
                <div className="edit-pricing-field">
                  <div className="edit-pricing-label">
                    <DollarSign size={16} />
                    Original Price (UGX) *
                  </div>
                  <input
                    type="number"
                    name="original_price"
                    value={formData.original_price}
                    onChange={handleChange}
                    className="edit-pricing-input"
                    placeholder="50,000"
                    min="1"
                    required
                  />
                </div>

                <div className="edit-pricing-field">
                  <div className="edit-pricing-label">
                    <Tag size={16} />
                    Deal Price (UGX) *
                  </div>
                  <input
                    type="number"
                    name="discount_price"
                    value={formData.discount_price}
                    onChange={handleChange}
                    className="edit-pricing-input"
                    placeholder="25,000"
                    min="1"
                    required
                  />
                </div>

                <div className="edit-pricing-field">
                  <div className="edit-pricing-label discount-label">
                    <span>💰</span>
                    You Save
                  </div>
                  <div className="edit-discount-display">
                    <span className="edit-discount-percentage">{calculateDiscount()}%</span>
                    <span className="edit-discount-text">OFF</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Category and Location */}
            <div className="edit-form-section">
              <div className="edit-section-header">
                <MapPin className="edit-section-icon" />
                <h3>Category & Location</h3>
              </div>

              <div className="edit-form-grid">
                <div className="edit-form-group">
                  <label className="edit-form-label">Category *</label>
                  <select
                    name="category_id"
                    value={formData.category_id}
                    onChange={handleChange}
                    className="edit-form-control"
                    required
                  >
                    <option value="">Select a category</option>
                    {categories.map((category) => (
                      <option key={category.id} value={category.id}>
                        {category.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="edit-form-group">
                  <label className="edit-form-label">Location *</label>
                  <input
                    type="text"
                    name="location"
                    value={formData.location}
                    onChange={handleChange}
                    className="edit-form-control"
                    placeholder="e.g., Kampala, Uganda"
                    required
                  />
                </div>
              </div>
            </div>

            {/* Main Image Upload */}
            <div className="edit-form-section">
              <div className="edit-section-header">
                <ImageIcon className="edit-section-icon" />
                <h3>Deal Images</h3>
              </div>

              <div className="edit-image-section">
                <div className="edit-form-group">
                  <label className="edit-form-label">Main Deal Image</label>
                  {mainImagePreview ? (
                    <div className="uploaded-image-container">
                      <img
                        src={mainImagePreview || "/placeholder.svg"}
                        alt="Main deal image"
                        className="edit-image-preview"
                      />
                      <button type="button" onClick={removeMainImage} className="remove-image-button">
                        <X size={16} />
                      </button>
                    </div>
                  ) : (
                    <div className="edit-image-upload" onClick={() => fileInputRef.current?.click()}>
                      <Upload size={32} />
                      <p>Click to upload main image</p>
                    </div>
                  )}
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleMainImageChange}
                    style={{ display: "none" }}
                  />
                  <small className="form-help-enhanced">
                    Upload a high-quality image that represents your deal (JPG, PNG, max 5MB)
                  </small>
                </div>

                <ImageUpload images={images} onImagesChange={setImages} maxImages={10} label="Additional Deal Images" />
              </div>
            </div>

            {/* Fine Prints */}
            <div className="edit-form-section">
              <div className="edit-section-header">
                <FileText className="edit-section-icon" />
                <h3>Terms & Conditions</h3>
              </div>

              <div className="edit-form-group">
                <label className="edit-form-label">Fine Prints & Terms</label>
                <textarea
                  name="fine_prints"
                  value={formData.fine_prints}
                  onChange={handleChange}
                  className="edit-form-control edit-textarea"
                  rows={3}
                  placeholder="Important conditions, restrictions, or terms for this deal"
                />
                <small className="form-help-enhanced">Important conditions and restrictions for this deal</small>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="edit-form-sidebar">
            {/* Deal Settings */}
            <div className="sidebar-section">
              <div className="sidebar-header">
                <Calendar className="sidebar-icon" />
                <h4>Deal Settings</h4>
              </div>

              <div className="sidebar-content">
                <div className="edit-form-group">
                  <label className="edit-form-label">Start Date *</label>
                  <input
                    type="date"
                    name="start_date"
                    value={formData.start_date}
                    onChange={handleChange}
                    className="edit-form-control"
                    required
                  />
                </div>

                <div className="edit-form-group">
                  <label className="edit-form-label">End Date *</label>
                  <input
                    type="date"
                    name="end_date"
                    value={formData.end_date}
                    onChange={handleChange}
                    className="edit-form-control"
                    required
                  />
                </div>

                <div className="edit-form-group">
                  <label className="edit-form-label">Maximum Quantity *</label>
                  <input
                    type="number"
                    name="max_quantity"
                    value={formData.max_quantity}
                    onChange={handleChange}
                    className="edit-form-control"
                    placeholder="100"
                    min="1"
                    required
                  />
                  <small className="form-help-enhanced">Total number of deals available</small>
                </div>

                <div className="edit-form-group">
                  <label className="edit-form-label">Current Status</label>
                  <div className="edit-form-control" style={{ background: "var(--background-secondary)" }}>
                    <span className={`status-badge status-${deal.status}`}>{deal.status}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Deal Preview */}
            <div className="sidebar-section">
              <div className="sidebar-header">
                <span>👁️</span>
                <h4>Deal Preview</h4>
              </div>

              <div className="deal-preview-card">
                {mainImagePreview && (
                  <img src={mainImagePreview || "/placeholder.svg"} alt="Deal preview" className="preview-image" />
                )}
                <div className="preview-content">
                  <h5>{formData.title || "Deal Title"}</h5>
                  <p>{formData.short_description || "Short description"}</p>

                  <div className="preview-pricing">
                    <span className="preview-price">UGX {Number(formData.discount_price || 0).toLocaleString()}</span>
                    <span className="preview-original-price">
                      UGX {Number(formData.original_price || 0).toLocaleString()}
                    </span>
                  </div>

                  {calculateDiscount() > 0 && <div className="preview-discount-badge">{calculateDiscount()}% OFF</div>}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="edit-form-actions">
          <button type="button" onClick={() => navigate("/deals")} className="edit-btn-cancel">
            Cancel
          </button>
          <button type="submit" className="edit-btn-submit" disabled={loading}>
            {loading ? (
              <div className="btn-loading">
                <div className="spinner-small"></div>
                <span>Updating...</span>
              </div>
            ) : (
              <>
                <Save size={16} />
                Update Deal
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  )
}

export default EditDeal
