"use client"
import type React from "react"
import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { ArrowLeft, Upload, X, ImageIcon, DollarSign, Calendar, MapPin, Tag, FileText, Eye } from "lucide-react"
import { api } from "../services/api"
import toast from "react-hot-toast"
import ImageUpload from "../components/ImageUpload"

interface Category {
  id: number
  name: string
}

const CreateDeal: React.FC = () => {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [categoriesLoading, setCategoriesLoading] = useState(true)
  const [categories, setCategories] = useState<Category[]>([])
  const [images, setImages] = useState<string[]>([])
  const [mainImage, setMainImage] = useState<string>("")
  const [mainImageFile, setMainImageFile] = useState<File | null>(null)

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    short_description: "",
    original_price: "",
    discount_price: "",
    category_id: "",
    start_date: "",
    end_date: "",
    max_quantity: "100",
    location: "",
    fine_prints: "",
  })

  useEffect(() => {
    fetchCategories()
    const today = new Date()
    const nextWeek = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000)
    setFormData((prev) => ({
      ...prev,
      start_date: today.toISOString().split("T")[0],
      end_date: nextWeek.toISOString().split("T")[0],
    }))
  }, [])

  const fetchCategories = async () => {
    try {
      setCategoriesLoading(true)
      const response = await api.get("/categories")
      if (response.data && response.data.categories && Array.isArray(response.data.categories)) {
        setCategories(response.data.categories)
      }
    } catch (error: any) {
      console.error("Failed to fetch categories:", error)
      toast.error("Failed to load categories")
      setCategories([])
    } finally {
      setCategoriesLoading(false)
    }
  }

  const handleMainImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (!file.type.startsWith("image/")) {
      toast.error("Please select an image file")
      return
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image size should be less than 5MB")
      return
    }

    setMainImageFile(file)
    const formData = new FormData()
    formData.append("image", file)

    try {
      toast.loading("Uploading main image...")
      const response = await api.post("/upload/image", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      })

      if (response.data && response.data.url) {
        setMainImage(response.data.url)
        toast.dismiss()
        toast.success("Main image uploaded successfully!")
      }
    } catch (error: any) {
      toast.dismiss()
      console.error("Main image upload error:", error)
      toast.error("Failed to upload main image")
      setMainImageFile(null)
    }
  }

  const removeMainImage = () => {
    setMainImage("")
    setMainImageFile(null)
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!mainImage) {
      toast.error("Please upload a main image for your deal")
      return
    }

    if (Number(formData.discount_price) >= Number(formData.original_price)) {
      toast.error("Discount price must be less than original price")
      return
    }

    if (new Date(formData.end_date) <= new Date(formData.start_date)) {
      toast.error("End date must be after start date")
      return
    }

    if (images.length > 10) {
      toast.error("Maximum 10 additional images allowed")
      return
    }

    setLoading(true)

    try {
      const dealData = {
        ...formData,
        original_price: Number(formData.original_price),
        discount_price: Number(formData.discount_price),
        category_id: Number(formData.category_id),
        max_quantity: Number(formData.max_quantity),
        start_date: new Date(formData.start_date).toISOString(),
        end_date: new Date(formData.end_date).toISOString(),
        image_url: mainImage,
        images: images,
      }

      await api.post("/deals", dealData)
      toast.success("Deal created successfully! It's now pending admin approval.")
      navigate("/deals")
    } catch (error: any) {
      console.error("Create deal error:", error)
      toast.error(error.response?.data?.error || "Failed to create deal")
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

  return (
    <div className="create-deal-page">
      <div className="container">
        {/* Header */}
        <div className="page-header-enhanced">
          <button onClick={() => navigate("/deals")} className="btn-back-enhanced">
            <ArrowLeft size={18} />
            <span>Back to Deals</span>
          </button>
          <div className="page-title-section">
            <h1>Create New Deal</h1>
            <p>Create an amazing deal for your customers and boost your sales</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="create-deal-form">
          <div className="form-layout-enhanced">
            {/* Main Content */}
            <div className="form-main-content">
              {/* Basic Information */}
              <div className="form-section-enhanced">
                <div className="section-header-form">
                  <FileText className="section-icon" />
                  <div>
                    <h3>Deal Information</h3>
                    <p>Basic details about your deal</p>
                  </div>
                </div>

                <div className="form-grid">
                  <div className="form-group-enhanced full-width">
                    <label className="form-label-enhanced">
                      <Tag size={16} />
                      Deal Title *
                    </label>
                    <input
                      type="text"
                      name="title"
                      value={formData.title}
                      onChange={handleChange}
                      className="form-control-enhanced"
                      placeholder="e.g., 50% Off Delicious Pizza at Mario's Restaurant"
                      required
                    />
                  </div>

                  <div className="form-group-enhanced full-width">
                    <label className="form-label-enhanced">
                      <FileText size={16} />
                      Short Description *
                    </label>
                    <input
                      type="text"
                      name="short_description"
                      value={formData.short_description}
                      onChange={handleChange}
                      className="form-control-enhanced"
                      placeholder="Brief description for deal cards"
                      maxLength={100}
                      required
                    />
                    <div className="character-count">{formData.short_description.length}/100 characters</div>
                  </div>

                  <div className="form-group-enhanced full-width">
                    <label className="form-label-enhanced">
                      <FileText size={16} />
                      Full Description *
                    </label>
                    <textarea
                      name="description"
                      value={formData.description}
                      onChange={handleChange}
                      className="form-control-enhanced textarea-enhanced"
                      rows={5}
                      placeholder="Detailed description of your deal, what's included, and why customers should buy it..."
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Enhanced Pricing Section */}
              <div className="form-section-enhanced">
                <div className="section-header-form">
                  <DollarSign className="section-icon" />
                  <div>
                    <h3>Pricing Details</h3>
                    <p>Set your original and discounted prices clearly</p>
                  </div>
                </div>

                <div className="pricing-grid">
                  <div className="pricing-field">
                    <div className="pricing-label">
                      <DollarSign size={16} />
                      Original Price (UGX) *
                    </div>
                    <input
                      type="number"
                      name="original_price"
                      value={formData.original_price}
                      onChange={handleChange}
                      className="pricing-input original"
                      placeholder="50,000"
                      min="1"
                      required
                    />
                    <div className="form-help-enhanced">The regular price of your product/service</div>
                  </div>

                  <div className="pricing-field">
                    <div className="pricing-label">
                      <Tag size={16} />
                      Deal Price (UGX) *
                    </div>
                    <input
                      type="number"
                      name="discount_price"
                      value={formData.discount_price}
                      onChange={handleChange}
                      className="pricing-input"
                      placeholder="25,000"
                      min="1"
                      required
                    />
                    <div className="form-help-enhanced">The discounted price customers will pay</div>
                  </div>

                  <div className="pricing-field">
                    <div className="pricing-label discount-label">
                      <span>💰</span>
                      You Save
                    </div>
                    <div className="discount-display">
                      <span className="discount-percentage">{calculateDiscount()}%</span>
                      <span className="discount-text">OFF</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Category & Location */}
              <div className="form-section-enhanced">
                <div className="section-header-form">
                  <MapPin className="section-icon" />
                  <div>
                    <h3>Category & Location</h3>
                    <p>Categorize and locate your deal</p>
                  </div>
                </div>

                <div className="form-grid">
                  <div className="form-group-enhanced">
                    <label className="form-label-enhanced">Category *</label>
                    <select
                      name="category_id"
                      value={formData.category_id}
                      onChange={handleChange}
                      className="form-control-enhanced"
                      required
                      disabled={categoriesLoading}
                    >
                      <option value="">{categoriesLoading ? "Loading categories..." : "Select a category"}</option>
                      {categories.map((category) => (
                        <option key={category.id} value={category.id}>
                          {category.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="form-group-enhanced">
                    <label className="form-label-enhanced">Location *</label>
                    <input
                      type="text"
                      name="location"
                      value={formData.location}
                      onChange={handleChange}
                      className="form-control-enhanced"
                      placeholder="e.g., Kampala, Garden City Mall"
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Images */}
              <div className="form-section-enhanced">
                <div className="section-header-form">
                  <ImageIcon className="section-icon" />
                  <div>
                    <h3>Deal Images</h3>
                    <p>Upload attractive images to showcase your deal</p>
                  </div>
                </div>

                <div className="image-upload-section">
                  <div className="main-image-section">
                    <label className="form-label-enhanced">Main Deal Image *</label>
                    {!mainImage ? (
                      <div className="image-upload-area-enhanced">
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleMainImageUpload}
                          className="image-upload-input-enhanced"
                          id="main-image-upload"
                          required
                        />
                        <label htmlFor="main-image-upload" className="image-upload-label-enhanced">
                          <Upload size={32} />
                          <span>Click to upload main image</span>
                          <small>PNG, JPG up to 5MB</small>
                        </label>
                      </div>
                    ) : (
                      <div className="uploaded-image-container">
                        <img
                          src={mainImage || "/placeholder.svg"}
                          alt="Main deal image"
                          className="uploaded-main-image"
                        />
                        <button type="button" onClick={removeMainImage} className="remove-image-button">
                          <X size={16} />
                        </button>
                      </div>
                    )}
                    <small className="form-help-enhanced">This will be the main image displayed on deal cards</small>
                  </div>

                  <ImageUpload
                    images={images}
                    onImagesChange={setImages}
                    maxImages={10}
                    label="Additional Deal Images (Optional)"
                  />
                </div>
              </div>

              {/* Fine Prints */}
              <div className="form-section-enhanced">
                <div className="section-header-form">
                  <FileText className="section-icon" />
                  <div>
                    <h3>Terms & Conditions</h3>
                    <p>Important conditions and restrictions</p>
                  </div>
                </div>

                <div className="form-group-enhanced">
                  <label className="form-label-enhanced">Fine Prints</label>
                  <textarea
                    name="fine_prints"
                    value={formData.fine_prints}
                    onChange={handleChange}
                    className="form-control-enhanced textarea-enhanced"
                    rows={3}
                    placeholder="e.g., Valid for dine-in only. Cannot be combined with other offers. Must present voucher upon arrival."
                  />
                  <small className="form-help-enhanced">Important conditions and restrictions for this deal</small>
                </div>
              </div>
            </div>

            {/* Sidebar */}
            <div className="form-sidebar">
              {/* Deal Settings */}
              <div className="sidebar-section">
                <div className="sidebar-header">
                  <Calendar className="sidebar-icon" />
                  <h4>Deal Settings</h4>
                </div>

                <div className="sidebar-content">
                  <div className="form-group-enhanced">
                    <label className="form-label-enhanced">Start Date *</label>
                    <input
                      type="date"
                      name="start_date"
                      value={formData.start_date}
                      onChange={handleChange}
                      className="form-control-enhanced"
                      required
                    />
                  </div>

                  <div className="form-group-enhanced">
                    <label className="form-label-enhanced">End Date *</label>
                    <input
                      type="date"
                      name="end_date"
                      value={formData.end_date}
                      onChange={handleChange}
                      className="form-control-enhanced"
                      required
                    />
                  </div>

                  <div className="form-group-enhanced">
                    <label className="form-label-enhanced">Maximum Quantity *</label>
                    <input
                      type="number"
                      name="max_quantity"
                      value={formData.max_quantity}
                      onChange={handleChange}
                      className="form-control-enhanced"
                      min="1"
                      required
                    />
                    <small className="form-help-enhanced">How many deals can be sold?</small>
                  </div>
                </div>
              </div>

              {/* Deal Preview */}
              <div className="sidebar-section">
                <div className="sidebar-header">
                  <Eye className="sidebar-icon" />
                  <h4>Deal Preview</h4>
                </div>

                <div className="deal-preview-card">
                  {(mainImage || images.length > 0) && (
                    <img
                      src={mainImage || images[0] || "/placeholder.svg"}
                      alt="Deal preview"
                      className="preview-image"
                      onError={(e) => {
                        e.currentTarget.style.display = "none"
                      }}
                    />
                  )}
                  <div className="preview-content">
                    <h5>{formData.title || "Deal Title"}</h5>
                    <p>{formData.short_description || "Short description will appear here"}</p>

                    <div className="preview-pricing">
                      <span className="preview-price">
                        UGX {Number(formData.discount_price).toLocaleString() || "0"}
                      </span>
                      {formData.original_price && (
                        <span className="preview-original-price">
                          UGX {Number(formData.original_price).toLocaleString()}
                        </span>
                      )}
                    </div>

                    {calculateDiscount() > 0 && (
                      <div className="preview-discount-badge">{calculateDiscount()}% OFF</div>
                    )}
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="form-actions-enhanced">
                <button type="button" onClick={() => navigate("/deals")} className="btn-cancel-enhanced">
                  Cancel
                </button>
                <button type="submit" className="btn-submit-enhanced" disabled={loading}>
                  {loading ? (
                    <div className="btn-loading">
                      <div className="spinner-small"></div>
                      <span>Creating...</span>
                    </div>
                  ) : (
                    <span>Create Deal</span>
                  )}
                </button>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  )
}

export default CreateDeal
