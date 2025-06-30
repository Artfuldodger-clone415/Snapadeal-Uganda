import { BrowserRouter as Router, Routes, Route } from "react-router-dom"
import { AuthProvider } from "./contexts/AuthContext"
import { Toaster } from "react-hot-toast"

import Navbar from "./components/Navbar"
import Sidebar from "./components/Sidebar"
import Login from "./pages/Login"
import Register from "./pages/Register"
import VerifyOTP from "./pages/VerifyOTP"
import ForgotPassword from "./pages/ForgotPassword"
import ResetPassword from "./pages/ResetPassword"
import Dashboard from "./pages/Dashboard"
import Deals from "./pages/Deals"
import CreateDeal from "./pages/CreateDeal"
import EditDeal from "./pages/EditDeal"
import Profile from "./pages/Profile"
import ProtectedRoute from "./components/ProtectedRoute"

import "./App.css"

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="App">
          <Toaster position="top-right" />
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/verify-otp" element={<VerifyOTP />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            <Route
              path="/*"
              element={
                <ProtectedRoute>
                  <div className="dashboard-layout">
                    <Sidebar />
                    <div className="main-content">
                      <Navbar />
                      <div className="content-area">
                        <Routes>
                          <Route path="/" element={<Dashboard />} />
                          <Route path="/deals" element={<Deals />} />
                          <Route path="/deals/create" element={<CreateDeal />} />
                          <Route path="/deals/edit/:id" element={<EditDeal />} />
                          <Route path="/profile" element={<Profile />} />
                        </Routes>
                      </div>
                    </div>
                  </div>
                </ProtectedRoute>
              }
            />
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  )
}

export default App
