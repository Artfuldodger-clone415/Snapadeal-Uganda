"use client"
import type React from "react"
import { useAuth } from "../contexts/AuthContext"
import { Navigate, useLocation } from "react-router-dom"

interface ProtectedRouteProps {
  children: React.ReactNode
  requireAuth?: boolean
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, requireAuth = true }) => {
  const { user, loading } = useAuth()
  const location = useLocation()

  if (loading) {
    return (
      <div className="container" style={{ marginTop: "3rem", textAlign: "center" }}>
        <div className="spinner-large"></div>
        <p>Loading...</p>
      </div>
    )
  }

  if (requireAuth && !user) {
    // Redirect to login with return URL
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  return <>{children}</>
}

export default ProtectedRoute
