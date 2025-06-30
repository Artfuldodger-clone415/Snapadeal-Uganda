"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from "react"
import { api } from "../services/api"

interface User {
  id: number
  first_name: string
  last_name: string
  email: string
  phone: string
  role: string
  status: string
  is_verified: boolean
}

interface AuthContextType {
  user: User | null
  token: string | null
  login: (emailOrPhone: string, password: string) => Promise<void>
  register: (userData: RegisterData) => Promise<{ email: string; status: string }>
  verifyOTP: (email: string, otp: string) => Promise<void>
  resendOTP: (email: string) => Promise<void>
  forgotPassword: (email: string) => Promise<void>
  resetPassword: (token: string, password: string) => Promise<void>
  logout: () => void
  loading: boolean
}

interface RegisterData {
  first_name: string
  last_name: string
  email: string
  phone: string
  password: string
  role: string
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}

interface AuthProviderProps {
  children: ReactNode
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null)
  const [token, setToken] = useState<string | null>(localStorage.getItem("admin_token"))
  const [loading, setLoading] = useState(true)

  const logout = useCallback(() => {
    setUser(null)
    setToken(null)
    localStorage.removeItem("admin_token")
  }, [])

  const fetchProfile = useCallback(async () => {
    try {
      const response = await api.get("/users/profile")
      const userData = response.data.user

      // Ensure user is an admin
      if (userData.role !== "admin") {
        throw new Error("Access denied. Admin account required.")
      }

      setUser(userData)
    } catch (error) {
      console.error("Failed to fetch profile:", error)
      logout()
    } finally {
      setLoading(false)
    }
  }, [logout])

  useEffect(() => {
    if (token) {
      fetchProfile()
    } else {
      setLoading(false)
    }
  }, [token, fetchProfile])

  // Enhanced login function - supports email OR phone
  const login = async (emailOrPhone: string, password: string) => {
    try {
      const response = await api.post("/auth/login", {
        email_or_phone: emailOrPhone,
        password,
      })

      const { user, token } = response.data

      // Ensure user is an admin
      if (user.role !== "admin") {
        throw new Error("Access denied. Admin account required.")
      }

      setUser(user)
      setToken(token)
      localStorage.setItem("admin_token", token)
    } catch (error: any) {
      // Handle specific error cases
      if (error.response?.data?.status === "pending_verification") {
        throw new Error("PENDING_VERIFICATION")
      }

      if (error.response?.data?.error?.includes("Admin account required")) {
        throw new Error("Access denied. This portal is for administrators only.")
      }

      throw new Error(error.response?.data?.error || "Login failed")
    }
  }

  // Enhanced register function - returns registration status instead of auto-login
  const register = async (userData: RegisterData): Promise<{ email: string; status: string }> => {
    try {
      const adminData = { ...userData, role: "admin" }
      const response = await api.post("/auth/register", adminData)

      // New API returns registration status, not immediate login
      return {
        email: response.data.email,
        status: response.data.status,
      }
    } catch (error: any) {
      throw new Error(error.response?.data?.error || "Registration failed")
    }
  }

  // New OTP verification function
  const verifyOTP = async (email: string, otp: string) => {
    try {
      const response = await api.post("/auth/verify-otp", { email, otp })
      const { user, token } = response.data

      // Ensure user is an admin
      if (user.role !== "admin") {
        throw new Error("Access denied. Admin account required.")
      }

      setUser(user)
      setToken(token)
      localStorage.setItem("admin_token", token)
    } catch (error: any) {
      throw new Error(error.response?.data?.error || "OTP verification failed")
    }
  }

  // New resend OTP function
  const resendOTP = async (email: string) => {
    try {
      await api.post("/auth/resend-otp", { email })
    } catch (error: any) {
      throw new Error(error.response?.data?.error || "Failed to resend OTP")
    }
  }

  // New forgot password function
  const forgotPassword = async (email: string) => {
    try {
      await api.post("/auth/forgot-password", { email })
    } catch (error: any) {
      throw new Error(error.response?.data?.error || "Failed to send reset email")
    }
  }

  // New reset password function
  const resetPassword = async (token: string, password: string) => {
    try {
      await api.post("/auth/reset-password", { token, password })
    } catch (error: any) {
      throw new Error(error.response?.data?.error || "Password reset failed")
    }
  }

  const value = {
    user,
    token,
    login,
    register,
    verifyOTP,
    resendOTP,
    forgotPassword,
    resetPassword,
    logout,
    loading,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
