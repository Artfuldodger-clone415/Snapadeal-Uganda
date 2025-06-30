import type React from "react"

const Footer: React.FC = () => {
  return (
    <footer
      style={{
        backgroundColor: "#333",
        color: "white",
        padding: "2rem 0",
        marginTop: "4rem",
      }}
    >
      <div className="container">
        <div className="row">
          <div className="col-4">
            <h5>Snapadeal</h5>
            <p>Uganda's premier deals and discounts platform</p>
          </div>
          <div className="col-4">
            <h6>Quick Links</h6>
            <ul style={{ listStyle: "none", padding: 0 }}>
              <li>
                <a href="/deals" style={{ color: "#ccc", textDecoration: "none" }}>
                  Browse Deals
                </a>
              </li>
              <li>
                <a href="/about" style={{ color: "#ccc", textDecoration: "none" }}>
                  About Us
                </a>
              </li>
              <li>
                <a href="/contact" style={{ color: "#ccc", textDecoration: "none" }}>
                  Contact
                </a>
              </li>
            </ul>
          </div>
          <div className="col-4">
            <h6>Support</h6>
            <ul style={{ listStyle: "none", padding: 0 }}>
              <li>
                <a href="/help" style={{ color: "#ccc", textDecoration: "none" }}>
                  Help Center
                </a>
              </li>
              <li>
                <a href="/terms" style={{ color: "#ccc", textDecoration: "none" }}>
                  Terms of Service
                </a>
              </li>
              <li>
                <a href="/privacy" style={{ color: "#ccc", textDecoration: "none" }}>
                  Privacy Policy
                </a>
              </li>
            </ul>
          </div>
        </div>
        <div className="text-center mt-4" style={{ borderTop: "1px solid #555", paddingTop: "1rem" }}>
          <p>&copy; 2025 Snapadeal. All rights reserved.</p>
        </div>
      </div>
    </footer>
  )
}

export default Footer
