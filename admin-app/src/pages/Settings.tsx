"use client"

import type React from "react"
import { Database, Mail, CreditCard, Shield } from "lucide-react"

const Settings: React.FC = () => {
  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h1>System Settings</h1>
          <p style={{ color: "var(--text-light)" }}>Configure platform settings and system preferences</p>
        </div>
      </div>

      <div className="row">
        <div className="col-6">
          <div className="card">
            <div className="card-header">
              <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                <Database size={20} />
                <h4>Database Settings</h4>
              </div>
            </div>
            <div className="card-body">
              <div style={{ marginBottom: "1rem" }}>
                <strong>Database Type:</strong> SQLite
              </div>
              <div style={{ marginBottom: "1rem" }}>
                <strong>Database File:</strong> snapadeal.db
              </div>
              <div style={{ marginBottom: "1rem" }}>
                <strong>Status:</strong> <span style={{ color: "var(--success)" }}>✅ Connected</span>
              </div>
              <button className="btn btn-outline btn-small">Backup Database</button>
            </div>
          </div>

          <div className="card">
            <div className="card-header">
              <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                <Mail size={20} />
                <h4>Email Configuration</h4>
              </div>
            </div>
            <div className="card-body">
              <div style={{ marginBottom: "1rem" }}>
                <strong>SMTP Status:</strong> <span style={{ color: "var(--warning)" }}>⚠️ Not Configured</span>
              </div>
              <p style={{ fontSize: "0.9rem", color: "var(--text-light)", marginBottom: "1rem" }}>
                Configure SMTP settings to enable email notifications for deal approvals and user communications.
              </p>
              <button className="btn btn-outline btn-small">Configure Email</button>
            </div>
          </div>
        </div>

        <div className="col-6">
          <div className="card">
            <div className="card-header">
              <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                <CreditCard size={20} />
                <h4>Payment Gateway</h4>
              </div>
            </div>
            <div className="card-body">
              <div style={{ marginBottom: "1rem" }}>
                <strong>Provider:</strong> Flutterwave
              </div>
              <div style={{ marginBottom: "1rem" }}>
                <strong>Status:</strong> <span style={{ color: "var(--success)" }}>✅ Connected</span>
              </div>
              <div style={{ marginBottom: "1rem" }}>
                <strong>Mode:</strong> Test Mode
              </div>
              <button className="btn btn-outline btn-small">Update Keys</button>
            </div>
          </div>

          <div className="card">
            <div className="card-header">
              <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                <Shield size={20} />
                <h4>Security Settings</h4>
              </div>
            </div>
            <div className="card-body">
              <div style={{ marginBottom: "1rem" }}>
                <strong>JWT Secret:</strong> <span style={{ color: "var(--success)" }}>✅ Configured</span>
              </div>
              <div style={{ marginBottom: "1rem" }}>
                <strong>Session Timeout:</strong> 7 days
              </div>
              <div style={{ marginBottom: "1rem" }}>
                <strong>Password Policy:</strong> Minimum 6 characters
              </div>
              <button className="btn btn-outline btn-small">Update Security</button>
            </div>
          </div>
        </div>
      </div>

      {/* System Information */}
      <div className="card">
        <div className="card-header">
          <h4>System Information</h4>
        </div>
        <div className="card-body">
          <div className="row">
            <div className="col-3">
              <strong>Platform Version:</strong>
              <div>Snapadeal v1.0.0</div>
            </div>
            <div className="col-3">
              <strong>Environment:</strong>
              <div>Development</div>
            </div>
            <div className="col-3">
              <strong>Server Time:</strong>
              <div>{new Date().toLocaleString()}</div>
            </div>
            <div className="col-3">
              <strong>Uptime:</strong>
              <div>Running</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Settings
