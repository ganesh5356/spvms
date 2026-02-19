import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'

export default function Landing() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const swaggerUrl = `${window.location.protocol}//${window.location.hostname}:8082/swagger-ui.html`

  return (
    <section className="landing">
      <nav className={`landing-nav ${scrolled ? 'scrolled' : ''}`}>
        <div className="nav-container">
          <Link to="/" className="nav-brand">
            <span className="nav-logo">SVPMS</span>
          </Link>

          <button className="nav-toggle" onClick={() => setIsMenuOpen(!isMenuOpen)}>
            {isMenuOpen ? '✕' : '☰'}
          </button>

          <div className={`nav-links ${isMenuOpen ? 'active' : ''}`}>
            <a href="#features" onClick={() => setIsMenuOpen(false)}>Features</a>
            <a href="#workflow" onClick={() => setIsMenuOpen(false)}>Workflow</a>
            <a href={swaggerUrl} target="_blank" rel="noopener noreferrer">API Docs</a>
            <div className="nav-cta">
              <Link to="/login" className="nav-btn-login">Login</Link>
              <Link to="/register" className="nav-btn-get-started">Get Started</Link>
            </div>
          </div>
        </div>
      </nav>
      {isMenuOpen && <div className="nav-overlay" onClick={() => setIsMenuOpen(false)}></div>}

      <div className="landing-header-area">
        <div className="landing-hero">
          <div className="landing-hero-text">
            <h1>SVPMS — Supplier & Vendor Procurement Management System</h1>
            <p>
              SVPMS is a procurement workflow platform built on Spring Boot + JWT security.
              It helps teams manage vendors, raise purchase requisitions (PR), generate purchase orders (PO),
              and track approvals in a clean, role-aware process.
            </p>
            <div className="landing-hero-cta">
              <Link to="/login" className="btn btn-primary">Get Started</Link>
              <Link to="/register" className="btn btn-outline" style={{ borderColor: 'rgba(255,255,255,0.3)', color: 'white' }}>Create Account</Link>
            </div>
            <div className="landing-badges">
              <span className="badge" style={{ background: 'rgba(255,255,255,0.1)', color: 'white', border: '1px solid rgba(255,255,255,0.1)' }}>JWT Authentication</span>
              <span className="badge" style={{ background: 'rgba(255,255,255,0.1)', color: 'white', border: '1px solid rgba(255,255,255,0.1)' }}>Vendor Search</span>
              <span className="badge" style={{ background: 'rgba(255,255,255,0.1)', color: 'white', border: '1px solid rgba(255,255,255,0.1)' }}>PR Approval Flow</span>
              <span className="badge" style={{ background: 'rgba(255,255,255,0.1)', color: 'white', border: '1px solid rgba(255,255,255,0.1)' }}>PO Delivery Tracking</span>
            </div>
          </div>
          <div className="landing-hero-media">
            <div className="hero-placeholder-icon">🛡️</div>
          </div>
        </div>
      </div>

      <div className="landing-stats">
        <div className="stat-card">
          <div className="stat-number">360°</div>
          <div className="stat-label">Full Procurement Coverage</div>
        </div>
        <div className="stat-card">
          <div className="stat-number">Secure</div>
          <div className="stat-label">JWT Managed Access</div>
        </div>
        <div className="stat-card">
          <div className="stat-number">Real-time</div>
          <div className="stat-label">Approval Tracking</div>
        </div>
        <div className="stat-card">
          <div className="stat-number">Role-based</div>
          <div className="stat-label">Access Control</div>
        </div>
      </div>

      <div className="landing-section" id="features">
        <h2>What you can do</h2>
        <div className="feature-grid">
          <div className="feature-card">
            <div className="feature-icon">🏢</div>
            <h3>Vendor Management</h3>
            <p>Create vendors, update details, soft delete, and search by rating, location, and category.</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">📋</div>
            <h3>Purchase Requisitions</h3>
            <p>Create PRs with items and quantities, submit for review, and view approval history for audit.</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">📦</div>
            <h3>Purchase Orders</h3>
            <p>Create POs from approved PRs, apply GST, track delivered quantity, and close orders.</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">👥</div>
            <h3>Users & Roles</h3>
            <p>Register users with roles and manage users (update or deactivate) from the admin view.</p>
          </div>
        </div>
      </div>

      <div className="landing-section split" id="workflow">
        <div>
          <h2>Professional workflow</h2>
          <p>
            SVPMS follows a practical procurement lifecycle:
            vendor onboarding → requisition creation → approval → purchase order → delivery → closure.
            The frontend provides dedicated create buttons (modal forms) and clear tables for day-to-day operations.
          </p>
          <div className="steps">
            <div className="step"><span className="step-num">1</span><span>Register / Login (JWT)</span></div>
            <div className="step"><span className="step-num">2</span><span>Onboard vendors & manage profiles</span></div>
            <div className="step"><span className="step-num">3</span><span>Create PR, submit, review history</span></div>
            <div className="step"><span className="step-num">4</span><span>Create PO, deliver, close</span></div>
          </div>
        </div>
        <div className="landing-hero-media">
          <div className="hero-placeholder-icon">🤝</div>
        </div>
      </div>

      <footer className="footer">
        <div className="footer-content">
          <div className="footer-column project-info">
            <h3>SVPMS</h3>
            <p>Supplier & Vendor Procurement Management System</p>
            <p className="footer-desc">A premium enterprise platform for streamlined procurement cycles.</p>
          </div>
          <div className="footer-column contact-info">
            <h4>Contact</h4>
            <p>📧 support@svpms.com</p>
            <p>📞 +91 98765 43210</p>
          </div>
          <div className="footer-column location-info">
            <h4>Address</h4>
            <p>SVPMS Tech Park, Sector 62</p>
            <p>Noida, Uttar Pradesh, 201301</p>
          </div>
          <div className="footer-column quick-links">
            <h4>Quick Links</h4>
            <a href="#features">Features</a>
            <a href="#workflow">Workflow</a>
            <Link to="/login">Login</Link>
          </div>
        </div>
        <div className="footer-bottom">
          <div className="footer-inner">
            <span>© {new Date().getFullYear()} SVPMS. All rights reserved.</span>
            <span className="footer-muted">Premium Procurement Solutions</span>
          </div>
        </div>
      </footer>
    </section >
  )
}
