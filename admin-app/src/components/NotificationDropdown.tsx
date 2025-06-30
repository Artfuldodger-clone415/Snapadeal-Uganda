"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Bell, Check, X, Send, Users, User, ShoppingBag } from "lucide-react"
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

const AdminNotificationDropdown: React.FC = () => {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [isOpen, setIsOpen] = useState(false)
  const [showBroadcast, setShowBroadcast] = useState(false)
  const [loading, setLoading] = useState(false)
  const [broadcastForm, setBroadcastForm] = useState({
    title: "",
    message: "",
    user_role: "all",
  })

  useEffect(() => {
    fetchNotifications()
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

  const sendBroadcast = async () => {
    if (!broadcastForm.title || !broadcastForm.message) {
      toast.error("Please fill in all fields")
      return
    }

    try {
      setLoading(true)
      const response = await api.post("/admin/notifications/broadcast", broadcastForm)
      toast.success(`Notification sent to ${response.data.count} users`)
      setBroadcastForm({ title: "", message: "", user_role: "all" })
      setShowBroadcast(false)
    } catch (error) {
      toast.error("Failed to send broadcast notification")
    } finally {
      setLoading(false)
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
      case "system_update":
        return "📢"
      default:
        return "📢"
    }
  }

  const getRoleIcon = (role: string) => {
    switch (role) {
      case "merchant":
        return <ShoppingBag size={14} />
      case "customer":
        return <User size={14} />
      default:
        return <Users size={14} />
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
    <div style={{ position: "relative" }}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        style={{
          background: "none",
          border: "none",
          cursor: "pointer",
          position: "relative",
          padding: "8px",
          borderRadius: "50%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Bell size={20} color="#666" />
        {unreadCount > 0 && (
          <span
            style={{
              position: "absolute",
              top: "-5px",
              right: "-5px",
              background: "#ff6900",
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
            width: "400px",
            maxHeight: "500px",
            background: "white",
            border: "1px solid #e0e0e0",
            borderRadius: "8px",
            boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
            zIndex: 1000,
            marginTop: "0.5rem",
          }}
        >
          <div
            style={{
              padding: "1rem",
              borderBottom: "1px solid #e0e0e0",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <h4 style={{ margin: 0, fontSize: "1rem" }}>Admin Notifications</h4>
            <div style={{ display: "flex", gap: "0.5rem" }}>
              <button
                onClick={() => setShowBroadcast(!showBroadcast)}
                style={{
                  background: "#ff6900",
                  color: "white",
                  border: "none",
                  padding: "6px 12px",
                  borderRadius: "4px",
                  fontSize: "0.8rem",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: "0.25rem",
                }}
              >
                <Send size={14} />
                Broadcast
              </button>
              {unreadCount > 0 && (
                <button
                  onClick={markAllAsRead}
                  disabled={loading}
                  style={{
                    background: "transparent",
                    color: "#666",
                    border: "1px solid #e0e0e0",
                    padding: "6px 12px",
                    borderRadius: "4px",
                    fontSize: "0.8rem",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    gap: "0.25rem",
                  }}
                >
                  <Check size={14} />
                  Mark all read
                </button>
              )}
            </div>
          </div>

          {showBroadcast && (
            <div style={{ padding: "1rem", borderBottom: "1px solid #e0e0e0" }}>
              <h5 style={{ margin: "0 0 1rem 0", fontSize: "0.9rem" }}>Send Broadcast Notification</h5>
              <div style={{ marginBottom: "1rem" }}>
                <label style={{ display: "block", marginBottom: "0.5rem", fontSize: "0.8rem", fontWeight: "600" }}>
                  Title
                </label>
                <input
                  type="text"
                  value={broadcastForm.title}
                  onChange={(e) => setBroadcastForm({ ...broadcastForm, title: e.target.value })}
                  placeholder="Notification title"
                  style={{
                    width: "100%",
                    padding: "8px",
                    border: "1px solid #e0e0e0",
                    borderRadius: "4px",
                    fontSize: "0.9rem",
                  }}
                />
              </div>
              <div style={{ marginBottom: "1rem" }}>
                <label style={{ display: "block", marginBottom: "0.5rem", fontSize: "0.8rem", fontWeight: "600" }}>
                  Message
                </label>
                <textarea
                  value={broadcastForm.message}
                  onChange={(e) => setBroadcastForm({ ...broadcastForm, message: e.target.value })}
                  placeholder="Notification message"
                  rows={3}
                  style={{
                    width: "100%",
                    padding: "8px",
                    border: "1px solid #e0e0e0",
                    borderRadius: "4px",
                    fontSize: "0.9rem",
                    resize: "vertical",
                  }}
                />
              </div>
              <div style={{ marginBottom: "1rem" }}>
                <label style={{ display: "block", marginBottom: "0.5rem", fontSize: "0.8rem", fontWeight: "600" }}>
                  Send to
                </label>
                <select
                  value={broadcastForm.user_role}
                  onChange={(e) => setBroadcastForm({ ...broadcastForm, user_role: e.target.value })}
                  style={{
                    width: "100%",
                    padding: "8px",
                    border: "1px solid #e0e0e0",
                    borderRadius: "4px",
                    fontSize: "0.9rem",
                  }}
                >
                  <option value="all">All Users</option>
                  <option value="merchant">Merchants Only</option>
                  <option value="customer">Customers Only</option>
                </select>
              </div>
              <div style={{ display: "flex", gap: "0.5rem" }}>
                <button
                  onClick={() => setShowBroadcast(false)}
                  style={{
                    flex: 1,
                    background: "transparent",
                    color: "#666",
                    border: "1px solid #e0e0e0",
                    padding: "8px",
                    borderRadius: "4px",
                    fontSize: "0.8rem",
                    cursor: "pointer",
                  }}
                >
                  Cancel
                </button>
                <button
                  onClick={sendBroadcast}
                  disabled={loading}
                  style={{
                    flex: 1,
                    background: "#ff6900",
                    color: "white",
                    border: "none",
                    padding: "8px",
                    borderRadius: "4px",
                    fontSize: "0.8rem",
                    cursor: "pointer",
                  }}
                >
                  {loading ? "Sending..." : "Send"}
                </button>
              </div>
            </div>
          )}

          <div style={{ maxHeight: "300px", overflowY: "auto" }}>
            {notifications.length === 0 ? (
              <div
                style={{
                  padding: "2rem",
                  textAlign: "center",
                  color: "#666",
                }}
              >
                <Bell size={32} style={{ marginBottom: "1rem", opacity: 0.5 }} />
                <p style={{ margin: 0 }}>No notifications yet</p>
              </div>
            ) : (
              notifications.map((notification) => (
                <div
                  key={notification.id}
                  style={{
                    padding: "1rem",
                    borderBottom: "1px solid #f0f0f0",
                    background: notification.is_read ? "transparent" : "#f8f9fa",
                    position: "relative",
                  }}
                >
                  <div style={{ display: "flex", alignItems: "flex-start", gap: "0.75rem" }}>
                    <span style={{ fontSize: "1.2rem" }}>{getNotificationIcon(notification.type)}</span>
                    <div style={{ flex: 1 }}>
                      <h6 style={{ margin: "0 0 0.25rem 0", fontSize: "0.9rem", fontWeight: "600" }}>
                        {notification.title}
                      </h6>
                      <p style={{ margin: "0 0 0.5rem 0", fontSize: "0.8rem", color: "#666", lineHeight: "1.4" }}>
                        {notification.message}
                      </p>
                      <small style={{ color: "#999" }}>{formatDate(notification.created_at)}</small>
                    </div>
                    <div style={{ display: "flex", gap: "0.25rem" }}>
                      {!notification.is_read && (
                        <button
                          onClick={() => markAsRead(notification.id)}
                          style={{
                            background: "transparent",
                            border: "1px solid #e0e0e0",
                            padding: "4px",
                            borderRadius: "4px",
                            cursor: "pointer",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                          }}
                        >
                          <Check size={12} />
                        </button>
                      )}
                      <button
                        onClick={() => deleteNotification(notification.id)}
                        style={{
                          background: "transparent",
                          border: "1px solid #e0e0e0",
                          padding: "4px",
                          borderRadius: "4px",
                          cursor: "pointer",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          color: "#dc3545",
                        }}
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

export default AdminNotificationDropdown
