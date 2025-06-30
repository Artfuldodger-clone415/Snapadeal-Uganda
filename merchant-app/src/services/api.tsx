import axios from "axios"

const API_BASE_URL = process.env.REACT_APP_API_URL || "http://localhost:8080/api/v1"

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
})

// Add token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("merchant_token")
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// Handle token expiration
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Only redirect to login if we're not already on login page
      if (!window.location.pathname.includes("/login")) {
        localStorage.removeItem("merchant_token")
        window.location.href = "/login"
      }
    }
    return Promise.reject(error)
  },
)

// Create a separate instance for public API calls (like categories)
export const publicApi = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
})

// Add response interceptor for public API (no auth handling)
publicApi.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error("Public API Error:", error)
    return Promise.reject(error)
  },
)
