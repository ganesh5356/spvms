import { Link } from 'react-router-dom'

export default function Landing() {
  const swaggerUrl = `${window.location.protocol}//${window.location.hostname}:8082/swagger-ui.html`
  return (
    <section className="landing">
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
            <Link to="/register" className="btn btn-outline">Create Account</Link>
          </div>
          <div className="landing-badges">
            <span className="badge">JWT Authentication</span>
            <span className="badge">Vendor Search</span>
            <span className="badge">PR Approval Flow</span>
            <span className="badge">PO Delivery Tracking</span>
          </div>
        </div>
        <div className="landing-hero-media">
          <div className="hero-placeholder-icon">🛡️</div>
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

      <div className="landing-section">
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

      <div className="landing-section split">
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
        <div className="footer-inner">
          <span>@svpms</span>
          <span className="footer-muted">Supplier & Vendor Procurement Management System</span>
        </div>
      </footer>
    </section>
  )
}
