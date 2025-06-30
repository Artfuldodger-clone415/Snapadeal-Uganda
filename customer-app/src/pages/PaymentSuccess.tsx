"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useSearchParams, useNavigate } from "react-router-dom"
import { useAuth } from "../contexts/AuthContext"
import { api } from "../services/api"
import toast from "react-hot-toast"

const PaymentSuccess: React.FC = () => {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const { user, loading: authLoading } = useAuth()
  const [loading, setLoading] = useState(true)
  const [transaction, setTransaction] = useState<any>(null)
  const [status, setStatus] = useState<string>("")
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    console.log("🔄 PaymentSuccess component mounted")
    console.log("👤 Current user:", user)
    console.log("🔗 URL params:", Object.fromEntries(searchParams.entries()))

    const transactionId = searchParams.get("transaction_id")
    const paymentStatus = searchParams.get("status")
    const txRef = searchParams.get("tx_ref")
    const errorParam = searchParams.get("error")

    console.log("📦 Extracted params:", { transactionId, paymentStatus, txRef, errorParam })

    if (errorParam) {
      setError(errorParam)
      setLoading(false)
      return
    }

    if (transactionId) {
      setStatus(paymentStatus || "")
      fetchTransaction(transactionId)
    } else {
      setError("No transaction ID found")
      setLoading(false)
    }
  }, [searchParams, user])

  const fetchTransaction = async (transactionId: string) => {
    try {
      console.log("🔄 Fetching transaction details for ID:", transactionId)

      // If user is not authenticated, wait a bit and try again
      if (!user && !authLoading) {
        console.log("⚠️ User not authenticated, waiting...")
        setTimeout(() => {
          if (!user) {
            console.log("❌ Still not authenticated, redirecting to login")
            toast.error("Please login to view transaction details")
            navigate("/login")
            return
          }
        }, 2000)
        return
      }

      const response = await api.get(`/transactions`)
      console.log("✅ Transactions response:", response.data)

      const transactions = response.data.transactions || []
      const foundTransaction = transactions.find((t: any) => t.id.toString() === transactionId)

      if (foundTransaction) {
        console.log("✅ Transaction found:", foundTransaction)
        setTransaction(foundTransaction)
        setStatus(foundTransaction.status)
      } else {
        console.log("❌ Transaction not found in user's transactions")
        setError("Transaction not found")
      }
    } catch (error: any) {
      console.error("❌ Failed to fetch transaction:", error)

      if (error.response?.status === 401) {
        console.log("❌ Unauthorized - redirecting to login")
        toast.error("Please login to view transaction details")
        navigate("/login")
        return
      }

      setError("Failed to load transaction details")
    } finally {
      setLoading(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
      case "successful":
        return "var(--success)"
      case "pending":
        return "var(--accent-orange)"
      case "failed":
        return "var(--error)"
      default:
        return "var(--text-light)"
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed":
      case "successful":
        return "✅"
      case "pending":
        return "⏳"
      case "failed":
        return "❌"
      default:
        return "❓"
    }
  }

  const getStatusMessage = (status: string) => {
    switch (status) {
      case "completed":
      case "successful":
        return "Payment Successful!"
      case "pending":
        return "Payment Pending"
      case "failed":
        return "Payment Failed"
      default:
        return "Payment Status Unknown"
    }
  }

  // Show loading while auth is loading
  if (authLoading) {
    return (
      <div className="container text-center" style={{ marginTop: "3rem" }}>
        <div className="spinner"></div>
        <p>Loading...</p>
      </div>
    )
  }

  // Show error if there's an error
  if (error) {
    return (
      <div className="container" style={{ marginTop: "3rem", maxWidth: "600px" }}>
        <div className="card">
          <div className="card-body text-center">
            <div style={{ fontSize: "4rem", marginBottom: "1rem" }}>❌</div>
            <h2 style={{ color: "var(--error)", marginBottom: "1rem" }}>Error</h2>
            <p style={{ marginBottom: "2rem" }}>{error}</p>
            <div className="d-flex gap-2 justify-content-center">
              <button onClick={() => navigate("/deals")} className="btn btn-primary">
                Browse Deals
              </button>
              <button onClick={() => navigate("/transactions")} className="btn btn-outline">
                View My Orders
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="container text-center" style={{ marginTop: "3rem" }}>
        <div className="spinner"></div>
        <p>Verifying payment...</p>
      </div>
    )
  }

  return (
    <div className="container" style={{ marginTop: "3rem", maxWidth: "600px" }}>
      <div className="card">
        <div className="card-body text-center">
          <div style={{ fontSize: "4rem", marginBottom: "1rem" }}>{getStatusIcon(status)}</div>

          <h2 style={{ color: getStatusColor(status), marginBottom: "1rem" }}>{getStatusMessage(status)}</h2>

          {transaction && (
            <div style={{ textAlign: "left", marginBottom: "2rem" }}>
              <h4>Transaction Details</h4>
              <div className="mb-3">
                <strong>Deal:</strong> {transaction.deal?.title}
              </div>
              <div className="mb-3">
                <strong>Quantity:</strong> {transaction.quantity}
              </div>
              <div className="mb-3">
                <strong>Amount:</strong>{" "}
                {new Intl.NumberFormat("en-UG", {
                  style: "currency",
                  currency: "UGX",
                  minimumFractionDigits: 0,
                }).format(transaction.amount)}
              </div>
              <div className="mb-3">
                <strong>Payment Method:</strong>{" "}
                {transaction.payment_method === "mtn_money" ? "MTN Mobile Money" : "Airtel Money"}
              </div>
              <div className="mb-3">
                <strong>Status:</strong>
                <span style={{ color: getStatusColor(status), fontWeight: "600", marginLeft: "0.5rem" }}>
                  {status.charAt(0).toUpperCase() + status.slice(1)}
                </span>
              </div>
              {transaction.payment_reference && (
                <div className="mb-3">
                  <strong>Reference:</strong> {transaction.payment_reference}
                </div>
              )}
            </div>
          )}

          {status === "completed" || status === "successful" ? (
            <div>
              <p style={{ color: "var(--success)", marginBottom: "2rem" }}>
                🎉 Thank you for your purchase! You can now enjoy your deal.
              </p>
              <div className="d-flex gap-2 justify-content-center">
                <button onClick={() => navigate("/transactions")} className="btn btn-primary">
                  View My Orders
                </button>
                <button onClick={() => navigate("/deals")} className="btn btn-outline">
                  Browse More Deals
                </button>
              </div>
            </div>
          ) : status === "failed" ? (
            <div>
              <p style={{ color: "var(--error)", marginBottom: "2rem" }}>
                😞 Your payment could not be processed. Please try again.
              </p>
              <div className="d-flex gap-2 justify-content-center">
                <button onClick={() => navigate("/deals")} className="btn btn-primary">
                  Try Again
                </button>
                <button onClick={() => navigate("/transactions")} className="btn btn-outline">
                  View My Orders
                </button>
              </div>
            </div>
          ) : (
            <div>
              <p style={{ color: "var(--accent-orange)", marginBottom: "2rem" }}>
                ⏳ Your payment is being processed. This may take a few minutes.
              </p>
              <div className="d-flex gap-2 justify-content-center">
                <button onClick={() => window.location.reload()} className="btn btn-primary">
                  Refresh Status
                </button>
                <button onClick={() => navigate("/transactions")} className="btn btn-outline">
                  View My Orders
                </button>
              </div>
            </div>
          )}

          {/* Debug Info */}
          {process.env.NODE_ENV === "development" && (
            <div className="mt-4" style={{ background: "#f8f9fa", padding: "1rem", borderRadius: "8px" }}>
              <h6>🔍 Debug Info</h6>
              <small>
                <div>User: {user ? `${user.first_name} ${user.last_name}` : "Not logged in"}</div>
                <div>Transaction ID: {searchParams.get("transaction_id")}</div>
                <div>Status: {status}</div>
                <div>TX Ref: {searchParams.get("tx_ref") || "None"}</div>
                <div>Error: {error || "None"}</div>
              </small>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default PaymentSuccess
