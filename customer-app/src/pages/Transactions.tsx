"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { api } from "../services/api"
import toast from "react-hot-toast"

interface Transaction {
  id: number
  quantity: number
  amount: number
  payment_method: string
  status: string
  created_at: string
  deal: {
    id: number
    title: string
    image_url: string
    category: {
      name: string
    }
  }
}

const Transactions: React.FC = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchTransactions()
  }, [])

  const fetchTransactions = async () => {
    try {
      const response = await api.get("/transactions")
      setTransactions(response.data.transactions || [])
    } catch (error) {
      console.error("Failed to fetch transactions:", error)
      toast.error("Failed to load transactions")
    } finally {
      setLoading(false)
    }
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("en-UG", {
      style: "currency",
      currency: "UGX",
      minimumFractionDigits: 0,
    }).format(price)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-UG", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "var(--success)"
      case "pending":
        return "var(--accent-orange)"
      case "failed":
        return "var(--error)"
      default:
        return "var(--text-light)"
    }
  }

  const getPaymentMethodLabel = (method: string) => {
    switch (method) {
      case "mtn_money":
        return "MTN Mobile Money"
      case "airtel_money":
        return "Airtel Money"
      default:
        return method
    }
  }

  if (loading) {
    return <div className="spinner"></div>
  }

  return (
    <div className="container" style={{ marginTop: "2rem" }}>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>My Orders</h2>
        <p style={{ color: "#666" }}>
          {transactions.length} order{transactions.length !== 1 ? "s" : ""}
        </p>
      </div>

      {transactions.length === 0 ? (
        <div className="text-center" style={{ padding: "3rem" }}>
          <h4>No orders yet</h4>
          <p>When you purchase deals, they'll appear here</p>
          <a href="/deals" className="btn btn-primary">
            Browse Deals
          </a>
        </div>
      ) : (
        <div>
          {transactions.map((transaction) => (
            <div key={transaction.id} className="card mb-3">
              <div className="card-body">
                <div className="row align-items-center">
                  <div className="col-2 col-md-12 mb-md-3">
                    <img
                      src={transaction.deal.image_url || "/placeholder.svg?height=80&width=80"}
                      alt={transaction.deal.title}
                      style={{
                        width: "80px",
                        height: "80px",
                        objectFit: "cover",
                        borderRadius: "8px",
                      }}
                    />
                  </div>

                  <div className="col-6 col-md-12">
                    <h5>{transaction.deal.title}</h5>
                    <p style={{ color: "#666", marginBottom: "0.5rem" }}>{transaction.deal.category.name}</p>
                    <p style={{ fontSize: "0.9rem", color: "#666" }}>
                      Quantity: {transaction.quantity} • {getPaymentMethodLabel(transaction.payment_method)}
                    </p>
                  </div>

                  <div className="col-2 col-md-12 text-center">
                    <div
                      style={{
                        color: getStatusColor(transaction.status),
                        fontWeight: "600",
                        fontSize: "0.9rem",
                        textTransform: "uppercase",
                        marginBottom: "0.5rem",
                      }}
                    >
                      {transaction.status}
                    </div>
                    <div style={{ fontSize: "0.8rem", color: "#666" }}>{formatDate(transaction.created_at)}</div>
                  </div>

                  <div className="col-2 col-md-12 text-right text-md-center">
                    <div style={{ fontSize: "1.2rem", fontWeight: "600" }}>{formatPrice(transaction.amount)}</div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default Transactions
