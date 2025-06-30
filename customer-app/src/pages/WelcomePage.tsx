"use client"
import type React from "react"
import { Link } from "react-router-dom"
import {
  ShoppingBag,
  Smartphone,
  Star,
  Users,
  MapPin,
  Clock,
  Apple,
  PlayCircle,
  TrendingUp,
  Shield,
  Zap,
  ArrowRight,
  Award,
  Heart,
} from "lucide-react"

const WelcomePage: React.FC = () => {
  return (
    <div className="welcome-page">
      {/* Hero Section */}
      <section className="hero-section-enhanced">
        <div className="hero-background-enhanced">
          <div className="container">
            <div className="hero-content-enhanced">
              <div className="hero-badge-enhanced">
                <span className="badge-flag">🇺🇬</span>
                <span>Uganda's #1 Deals Platform</span>
              </div>

              <h1 className="hero-title-enhanced">
                Discover Amazing Deals
                <span className="hero-title-accent"> in Uganda</span>
              </h1>

              <p className="hero-subtitle-enhanced">
                Save up to 90% on restaurants, activities, beauty treatments, travel experiences and more! Join
                thousands of smart shoppers getting the best deals in Uganda.
              </p>

              <div className="hero-cta-enhanced">
                <Link to="/register" className="btn-hero-primary-enhanced">
                  <Users size={20} />
                  <span>Join Now - It's Free!</span>
                  <ArrowRight size={18} />
                </Link>
                <Link to="/login" className="btn-hero-secondary-enhanced">
                  <ShoppingBag size={20} />
                  <span>Sign In to Browse Deals</span>
                </Link>
              </div>

              <div className="hero-stats-enhanced">
                <div className="hero-stat">
                  <div className="stat-icon-wrapper">
                    <Star className="stat-icon" />
                  </div>
                  <div className="stat-content">
                    <span className="stat-number">4.8/5</span>
                    <span className="stat-label">Rating</span>
                  </div>
                </div>
                <div className="hero-stat">
                  <div className="stat-icon-wrapper">
                    <Users className="stat-icon" />
                  </div>
                  <div className="stat-content">
                    <span className="stat-number">10,000+</span>
                    <span className="stat-label">Happy Customers</span>
                  </div>
                </div>
                <div className="hero-stat">
                  <div className="stat-icon-wrapper">
                    <MapPin className="stat-icon" />
                  </div>
                  <div className="stat-content">
                    <span className="stat-number">All</span>
                    <span className="stat-label">Major Cities</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="features-section-enhanced">
        <div className="container">
          <div className="section-header-enhanced">
            <div className="section-badge">Why Choose Us</div>
            <h2>The Smartest Way to Save Money in Uganda</h2>
            <p>Experience the best deals platform with unmatched benefits and security</p>
          </div>

          <div className="features-grid-enhanced">
            <div className="feature-card-enhanced">
              <div className="feature-icon-container">
                <TrendingUp className="feature-icon-enhanced" />
              </div>
              <h3>Best Prices Guaranteed</h3>
              <p>
                We negotiate the best deals with local businesses so you don't have to. Save up to 90% on your favorite
                activities.
              </p>
              <div className="feature-highlight">Up to 90% savings</div>
            </div>

            <div className="feature-card-enhanced">
              <div className="feature-icon-container">
                <Shield className="feature-icon-enhanced" />
              </div>
              <h3>Secure & Trusted</h3>
              <p>
                Your payments are protected with bank-level security. Shop with confidence knowing your money is safe.
              </p>
              <div className="feature-highlight">Bank-level security</div>
            </div>

            <div className="feature-card-enhanced">
              <div className="feature-icon-container">
                <Zap className="feature-icon-enhanced" />
              </div>
              <h3>Instant Vouchers</h3>
              <p>Get your vouchers instantly after purchase. No waiting, no hassle - just great deals ready to use.</p>
              <div className="feature-highlight">Instant delivery</div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="how-it-works-enhanced">
        <div className="container">
          <div className="section-header-enhanced">
            <div className="section-badge">Simple Process</div>
            <h2>How Snapadeal Works</h2>
            <p>Start saving money in just 3 simple steps</p>
          </div>

          <div className="steps-container-enhanced">
            <div className="step-card-enhanced">
              <div className="step-number-enhanced">1</div>
              <div className="step-icon-container">
                <Users className="step-icon-enhanced" />
              </div>
              <h3>Sign Up Free</h3>
              <p>Create your free account in seconds. No hidden fees, no commitments.</p>
            </div>

            <div className="step-connector"></div>

            <div className="step-card-enhanced">
              <div className="step-number-enhanced">2</div>
              <div className="step-icon-container">
                <ShoppingBag className="step-icon-enhanced" />
              </div>
              <h3>Browse & Buy</h3>
              <p>Discover amazing deals from local businesses and purchase securely online.</p>
            </div>

            <div className="step-connector"></div>

            <div className="step-card-enhanced">
              <div className="step-number-enhanced">3</div>
              <div className="step-icon-container">
                <Heart className="step-icon-enhanced" />
              </div>
              <h3>Enjoy & Save</h3>
              <p>Present your voucher and enjoy incredible savings at your favorite places!</p>
            </div>
          </div>
        </div>
      </section>

      {/* Mobile App Section */}
      <section className="mobile-app-section-enhanced">
        <div className="container">
          <div className="mobile-app-grid">
            <div className="mobile-app-content">
              <div className="section-badge">📱 Coming Soon</div>
              <h2>Get the Snapadeal Mobile App</h2>
              <p>
                Take amazing deals with you wherever you go! Our mobile app will give you instant access to exclusive
                mobile-only deals, push notifications for flash sales, and easy mobile payments.
              </p>

              <div className="app-features-list">
                <div className="app-feature-item">
                  <Clock className="app-feature-icon" />
                  <div>
                    <h4>Instant Notifications</h4>
                    <p>Never miss a flash sale or limited-time offer</p>
                  </div>
                </div>
                <div className="app-feature-item">
                  <Smartphone className="app-feature-icon" />
                  <div>
                    <h4>Mobile-Only Deals</h4>
                    <p>Exclusive offers available only on mobile</p>
                  </div>
                </div>
                <div className="app-feature-item">
                  <MapPin className="app-feature-icon" />
                  <div>
                    <h4>Location-Based Deals</h4>
                    <p>Find deals near you with GPS integration</p>
                  </div>
                </div>
              </div>

              <div className="app-download-section">
                <button className="app-store-btn apple-btn" disabled>
                  <Apple size={24} />
                  <div>
                    <span className="download-text">Download on the</span>
                    <span className="store-name">App Store</span>
                  </div>
                </button>
                <button className="app-store-btn google-btn" disabled>
                  <PlayCircle size={24} />
                  <div>
                    <span className="download-text">Get it on</span>
                    <span className="store-name">Google Play</span>
                  </div>
                </button>
              </div>

              <p className="app-launch-note">
                🚀 Mobile apps launching soon! Join now to be notified when they're available.
              </p>
            </div>

            <div className="mobile-app-mockup">
              <div className="phone-device">
                <div className="phone-screen-content">
                  <div className="app-interface">
                    <div className="app-header-demo">
                      <div className="app-logo-demo">📱 Snapadeal</div>
                      <div className="notification-indicator">3</div>
                    </div>
                    <div className="app-deal-preview">
                      <div className="deal-image-demo"></div>
                      <div className="deal-info-demo">
                        <div className="deal-title-demo">50% OFF Restaurant</div>
                        <div className="deal-price-demo">UGX 25,000</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="final-cta-enhanced">
        <div className="container">
          <div className="cta-content-enhanced">
            <div className="cta-icon-wrapper">
              <Award size={48} />
            </div>
            <h2>Ready to Start Saving?</h2>
            <p>Join thousands of smart shoppers who save money every day with Snapadeal Uganda</p>

            <Link to="/register" className="btn-cta-enhanced">
              <Users size={20} />
              <span>Join Snapadeal Now - Free!</span>
              <ArrowRight size={18} />
            </Link>

            <p className="cta-footer-text">
              Already have an account?{" "}
              <Link to="/login" className="cta-login-link">
                Sign in here
              </Link>
            </p>
          </div>
        </div>
      </section>
    </div>
  )
}

export default WelcomePage
