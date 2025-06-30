"use client"

import type React from "react"
import { useState, useRef } from "react"
import { Upload, X } from "lucide-react"
import { api } from "../services/api"
import toast from "react-hot-toast"

interface ImageUploadProps {
  images: string[]
  onImagesChange: (images: string[]) => void
  maxImages?: number
  label?: string
}

const ImageUpload: React.FC<ImageUploadProps> = ({
  images,
  onImagesChange,
  maxImages = 10,
  label = "Upload Images",
}) => {
  const [uploading, setUploading] = useState(false)
  const [dragActive, setDragActive] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFiles = async (files: FileList) => {
    if (files.length === 0) return

    if (images.length + files.length > maxImages) {
      toast.error(`Maximum ${maxImages} images allowed`)
      return
    }

    // Validate file types and sizes
    const validFiles: File[] = []
    const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/gif", "image/webp"]
    const maxSize = 5 * 1024 * 1024 // 5MB

    for (let i = 0; i < files.length; i++) {
      const file = files[i]

      if (!allowedTypes.includes(file.type)) {
        toast.error(`${file.name} is not a valid image type`)
        continue
      }

      if (file.size > maxSize) {
        toast.error(`${file.name} is too large (max 5MB)`)
        continue
      }

      validFiles.push(file)
    }

    if (validFiles.length === 0) return

    setUploading(true)
    try {
      const formData = new FormData()
      validFiles.forEach((file) => {
        formData.append("images", file)
      })

      const response = await api.post("/upload/images", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      })

      const uploadedUrls = response.data.files.map((file: any) => `http://localhost:8080${file.url}`)

      onImagesChange([...images, ...uploadedUrls])
      toast.success(`${validFiles.length} image(s) uploaded successfully`)
    } catch (error: any) {
      console.error("Upload error:", error)
      toast.error(error.response?.data?.error || "Failed to upload images")
    } finally {
      setUploading(false)
    }
  }

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true)
    } else if (e.type === "dragleave") {
      setDragActive(false)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFiles(e.dataTransfer.files)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      handleFiles(e.target.files)
    }
  }

  const removeImage = (index: number) => {
    const newImages = images.filter((_, i) => i !== index)
    onImagesChange(newImages)
  }

  const openFileDialog = () => {
    fileInputRef.current?.click()
  }

  return (
    <div className="form-group">
      <label className="form-label">
        {label} (Max {maxImages})
      </label>

      {/* Upload Area */}
      <div
        className={`upload-area ${dragActive ? "drag-active" : ""} ${uploading ? "uploading" : ""}`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        onClick={openFileDialog}
        style={{
          border: `2px dashed ${dragActive ? "var(--primary-green)" : "var(--border-color)"}`,
          borderRadius: "8px",
          padding: "2rem",
          textAlign: "center",
          cursor: uploading ? "not-allowed" : "pointer",
          background: dragActive ? "var(--background-light)" : "transparent",
          transition: "all 0.3s ease",
          marginBottom: "1rem",
        }}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept="image/*"
          onChange={handleInputChange}
          style={{ display: "none" }}
          disabled={uploading}
        />

        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "0.5rem" }}>
          <Upload size={32} color={dragActive ? "var(--primary-green)" : "var(--text-light)"} />
          <div>
            <p style={{ margin: 0, fontWeight: "600" }}>
              {uploading ? "Uploading..." : "Drop images here or click to browse"}
            </p>
            <small style={{ color: "var(--text-light)" }}>JPG, PNG, GIF, WebP up to 5MB each</small>
          </div>
        </div>
      </div>

      {/* Image Previews */}
      {images.length > 0 && (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(120px, 1fr))", gap: "1rem" }}>
          {images.map((image, index) => (
            <div key={index} style={{ position: "relative", borderRadius: "8px", overflow: "hidden" }}>
              <img
                src={image || "/placeholder.svg"}
                alt={`Upload ${index + 1}`}
                style={{
                  width: "100%",
                  height: "120px",
                  objectFit: "cover",
                  border: "1px solid var(--border-color)",
                }}
                onError={(e) => {
                  e.currentTarget.style.display = "none"
                }}
              />
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation()
                  removeImage(index)
                }}
                style={{
                  position: "absolute",
                  top: "4px",
                  right: "4px",
                  background: "rgba(0,0,0,0.7)",
                  color: "white",
                  border: "none",
                  borderRadius: "50%",
                  width: "24px",
                  height: "24px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  cursor: "pointer",
                }}
              >
                <X size={14} />
              </button>
            </div>
          ))}
        </div>
      )}

      <small style={{ color: "var(--text-light)" }}>
        {images.length}/{maxImages} images uploaded
      </small>
    </div>
  )
}

export default ImageUpload
