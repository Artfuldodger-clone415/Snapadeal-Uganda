"use client"
import type React from "react"
import { Link } from "react-router-dom"
import { ShoppingBag, Smartphone, Star, Users, MapPin, Clock, Apple, PlayCircle } from "lucide-react"

const Home: React.FC = () => {
  return (
    <div className="home">
      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-background">
          <div className="container">
            <div className="hero-content">
              <div className="hero-badge">🇺🇬 Uganda's #1 Deals Platform</div>
              <h1 className="hero-title">
                Discover Amazing Deals
                <span className="hero-accent"> in Uganda</span>
              </h1>
              <p className="hero-subtitle">
                Save up to 90% on restaurants, activities, beauty treatments, travel experiences and more! Join
                thousands of smart shoppers getting the best deals in Uganda.
              </p>

              <div className="hero-buttons">
                <Link to="/login" className="btn btn-primary btn-large hero-cta">
                  <Users size={20} />
                  Join Now - It's Free!
                </Link>
                <Link to="/deals" className="btn btn-outline btn-large">
                  <ShoppingBag size={20} />
                  Browse Deals
                </Link>
              </div>

              {/* Trust Indicators */}
              <div className="hero-stats">
                <div className="stat-item">
                  <Star className="stat-icon" />
                  <div>
                    <span className="stat-number">4.8/5</span>
                    <span className="stat-label">Rating</span>
                  </div>
                </div>
                <div className="stat-item">
                  <Users className="stat-icon" />
                  <div>
                    <span className="stat-number">10,000+</span>
                    <span className="stat-label">Happy Customers</span>
                  </div>
                </div>
                <div className="stat-item">
                  <MapPin className="stat-icon" />
                  <div>
                    <span className="stat-number">All</span>
                    <span className="stat-label">Major Cities</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Mobile App Section */}
      <section className="mobile-app-section">
        <div className="container">
          <div className="mobile-app-content">
            <div className="mobile-app-text">
              <div className="section-badge">📱 Coming Soon</div>
              <h2>Get the Snapadeal Mobile App</h2>
              <p>
                Take amazing deals with you wherever you go! Our mobile app will give you instant access to exclusive
                mobile-only deals, push notifications for flash sales, and easy mobile payments.
              </p>

              <div className="app-features">
                <div className="app-feature">
                  <Clock className="feature-icon" />
                  <div>
                    <h4>Instant Notifications</h4>
                    <p>Never miss a flash sale or limited-time offer</p>
                  </div>
                </div>
                <div className="app-feature">
                  <Smartphone className="feature-icon" />
                  <div>
                    <h4>Mobile-Only Deals</h4>
                    <p>Exclusive offers available only on mobile</p>
                  </div>
                </div>
                <div className="app-feature">
                  <MapPin className="feature-icon" />
                  <div>
                    <h4>Location-Based Deals</h4>
                    <p>Find deals near you with GPS integration</p>
                  </div>
                </div>
              </div>

              <div className="app-download-buttons">
                <button className="app-download-btn apple" disabled>
                  <Apple size={24} />
                  <div>
                    <span className="download-text">Download on the</span>
                    <span className="store-name">App Store</span>
                  </div>
                </button>
                <button className="app-download-btn google" disabled>
                  <PlayCircle size={24} />
                  <div>
                    <span className="download-text">Get it on</span>
                    <span className="store-name">Google Play</span>
                  </div>
                </button>
              </div>
              <p className="app-coming-soon">
                🚀 Mobile apps launching soon!{" "}
                <Link to="/login" className="join-link">
                  Join now
                </Link>{" "}
                to be notified when they're available.
              </p>
            </div>

            <div className="mobile-app-visual">
              <div className="phone-mockup">
                <div className="phone-screen">
                  <div className="app-preview">
                    <div className="app-header">
                      <div className="app-logo">📱 Snapadeal</div>
                      <div className="notification-badge">3</div>
                    </div>
                    <div className="app-deal-card">
                      <div className="app-deal-image"></div>
                      <div className="app-deal-info">
                        <div className="app-deal-title">50% OFF Restaurant</div>
                        <div className="app-deal-price">UGX 25,000</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="how-it-works-section">
        <div className="container">
          <div className="section-header">
            <h2>How Snapadeal Works</h2>
            <p>Start saving money in just 3 simple steps</p>
          </div>

          <div className="steps-grid">
            <div className="step-card">
              <div className="step-number">1</div>
              <div className="step-icon">
                <Users size={32} />
              </div>
              <h3 className="step-title">Sign Up Free</h3>
              <p className="step-description">Create your free account in seconds. No hidden fees, no commitments.</p>
            </div>

            <div className="step-card">
              <div className="step-number">2</div>
              <div className="step-icon">
                <ShoppingBag size={32} />
              </div>
              <h3 className="step-title">Browse & Buy</h3>
              <p className="step-description">
                Discover amazing deals from local businesses and purchase securely online.
              </p>
            </div>

            <div className="step-card">
              <div className="step-number">3</div>
              <div className="step-icon">
                <Star size={32} />
              </div>
              <h3 className="step-title">Enjoy & Save</h3>
              <p className="step-description">
                Present your voucher and enjoy incredible savings at your favorite places!
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="newsletter-section">
        <div className="container">
          <div className="newsletter-content">
            <h2>Ready to Start Saving?</h2>
            <p>Join thousands of smart shoppers who save money every day with Snapadeal Uganda</p>
            <Link to="/login" className="btn btn-primary btn-large">
              <Users size={20} />
              Join Snapadeal Now - Free!
            </Link>
            <p className="cta-subtext">
              Already have an account?{" "}
              <Link to="/login" className="login-link">
                Sign in here
              </Link>
            </p>
          </div>
        </div>
      </section>
    </div>
  )
}

export default Home
