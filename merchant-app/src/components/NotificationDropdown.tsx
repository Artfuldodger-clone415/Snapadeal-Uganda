"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Bell, Check, X } from "lucide-react"
import { api } from "../services/api"
import toast from "react-hot-toast"

interface Notification {
  id: number
  title: string
  message: string
  type: string
  is_read: boolean
  created_at: string
  data: string
}

const NotificationDropdown: React.FC = () => {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [isOpen, setIsOpen] = useState(false)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    fetchNotifications()
    // Poll for new notifications every 30 seconds
    const interval = setInterval(fetchNotifications, 30000)
    return () => clearInterval(interval)
  }, [])

  const fetchNotifications = async () => {
    try {
      const response = await api.get("/notifications")
      setNotifications(response.data.notifications || [])
      setUnreadCount(response.data.unread_count || 0)
    } catch (error) {
      console.error("Failed to fetch notifications:", error)
    }
  }

  const markAsRead = async (notificationId: number) => {
    try {
      await api.put(`/notifications/${notificationId}/read`)
      setNotifications((prev) =>
        prev.map((notif) => (notif.id === notificationId ? { ...notif, is_read: true } : notif)),
      )
      setUnreadCount((prev) => Math.max(0, prev - 1))
    } catch (error) {
      toast.error("Failed to mark notification as read")
    }
  }

  const markAllAsRead = async () => {
    try {
      setLoading(true)
      await api.put("/notifications/read-all")
      setNotifications((prev) => prev.map((notif) => ({ ...notif, is_read: true })))
      setUnreadCount(0)
      toast.success("All notifications marked as read")
    } catch (error) {
      toast.error("Failed to mark all notifications as read")
    } finally {
      setLoading(false)
    }
  }

  const deleteNotification = async (notificationId: number) => {
    try {
      await api.delete(`/notifications/${notificationId}`)
      setNotifications((prev) => prev.filter((notif) => notif.id !== notificationId))
      toast.success("Notification deleted")
    } catch (error) {
      toast.error("Failed to delete notification")
    }
  }

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "deal_approved":
        return "🎉"
      case "deal_rejected":
        return "❌"
      case "deal_purchased":
        return "💰"
      case "deal_expiring":
        return "⏰"
      default:
        return "📢"
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60))

    if (diffInHours < 1) return "Just now"
    if (diffInHours < 24) return `${diffInHours}h ago`
    if (diffInHours < 48) return "Yesterday"
    return date.toLocaleDateString()
  }

  return (
    <div className="notification-dropdown" style={{ position: "relative" }}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="btn btn-outline"
        style={{
          position: "relative",
          padding: "0.5rem",
          borderRadius: "50%",
          width: "40px",
          height: "40px",
        }}
      >
        <Bell size={18} />
        {unreadCount > 0 && (
          <span
            style={{
              position: "absolute",
              top: "-5px",
              right: "-5px",
              background: "var(--danger)",
              color: "white",
              borderRadius: "50%",
              width: "20px",
              height: "20px",
              fontSize: "0.7rem",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontWeight: "600",
            }}
          >
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div
          style={{
            position: "absolute",
            top: "100%",
            right: "0",
            width: "350px",
            maxHeight: "400px",
            background: "white",
            border: "1px solid var(--border-color)",
            borderRadius: "8px",
            boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
            zIndex: 1000,
            marginTop: "0.5rem",
          }}
        >
          <div
            style={{
              padding: "1rem",
              borderBottom: "1px solid var(--border-color)",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <h4 style={{ margin: 0 }}>Notifications</h4>
            {unreadCount > 0 && (
              <button onClick={markAllAsRead} className="btn btn-outline btn-small" disabled={loading}>
                <Check size={14} style={{ marginRight: "0.25rem" }} />
                Mark all read
              </button>
            )}
          </div>

          <div style={{ maxHeight: "300px", overflowY: "auto" }}>
            {notifications.length === 0 ? (
              <div
                style={{
                  padding: "2rem",
                  textAlign: "center",
                  color: "var(--text-light)",
                }}
              >
                <Bell size={32} style={{ marginBottom: "1rem", opacity: 0.5 }} />
                <p>No notifications yet</p>
              </div>
            ) : (
              notifications.map((notification) => (
                <div
                  key={notification.id}
                  style={{
                    padding: "1rem",
                    borderBottom: "1px solid var(--border-light)",
                    background: notification.is_read ? "transparent" : "var(--background-light)",
                    position: "relative",
                  }}
                >
                  <div style={{ display: "flex", alignItems: "flex-start", gap: "0.75rem" }}>
                    <span style={{ fontSize: "1.2rem" }}>{getNotificationIcon(notification.type)}</span>
                    <div style={{ flex: 1 }}>
                      <h6 style={{ margin: "0 0 0.25rem 0", fontSize: "0.9rem" }}>{notification.title}</h6>
                      <p style={{ margin: "0 0 0.5rem 0", fontSize: "0.8rem", color: "var(--text-light)" }}>
                        {notification.message}
                      </p>
                      <small style={{ color: "var(--text-light)" }}>{formatDate(notification.created_at)}</small>
                    </div>
                    <div style={{ display: "flex", gap: "0.25rem" }}>
                      {!notification.is_read && (
                        <button
                          onClick={() => markAsRead(notification.id)}
                          className="btn btn-outline btn-small"
                          style={{ padding: "0.25rem" }}
                        >
                          <Check size={12} />
                        </button>
                      )}
                      <button
                        onClick={() => deleteNotification(notification.id)}
                        className="btn btn-outline btn-small"
                        style={{ padding: "0.25rem", color: "var(--danger)" }}
                      >
                        <X size={12} />
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  )
}

export default NotificationDropdown
