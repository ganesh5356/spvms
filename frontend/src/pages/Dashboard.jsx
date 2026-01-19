import { useState, useEffect } from 'react'
import VendorsPage from './vendors/VendorsPage.jsx'
import PRPage from './pr/PRPage.jsx'
import POPage from './po/POPage.jsx'
import UsersPage from './users/UsersPage.jsx'
import { useAuth } from '../auth/AuthContext.jsx'
import { createClient } from '../api/client.js'
import { useNavigate } from "react-router-dom"

export default function Dashboard() {
  const [tab, setTab] = useState('vendors')
  const [poFilter, setPoFilter] = useState('all')
  const { hasRole, token } = useAuth()
  const client = createClient(() => token)
  const navigate = useNavigate()

  const [stats, setStats] = useState({
    vendors: 0,
    prs: 0,
    pos: 0,
    posWithAllGst: 0
  })

  useEffect(() => {
    async function loadStats() {
      try {
        const [vendorRes, prRes, poRes] = await Promise.all([
          client.get('/api/vendors').catch(() => []),
          client.get('/api/pr').catch(() => []),
          client.get('/api/po').catch(() => [])
        ])

        const posWithAllGstCount = Array.isArray(poRes)
          ? poRes.filter(po =>
              po.cgstAmount > 0 &&
              po.sgstAmount > 0 &&
              po.igstAmount > 0
            ).length
          : 0

        setStats({
          vendors: vendorRes?.length || 0,
          prs: prRes?.length || 0,
          pos: poRes?.length || 0,
          posWithAllGst: posWithAllGstCount
        })
      } catch (err) {
        console.error('Failed to load stats', err)
      }
    }

    loadStats()
  }, [])

  return (
    <section className="view dashboard">

      

      {/* ===== STATS SECTION ===== */}
      <section className="dashboard-section">
        <h3 className="section-title">Overview</h3>

        <div className="dashboard-stats">
          <StatCard label="Vendors" value={stats.vendors} icon="🏢" onClick={() => setTab('vendors')} />
          <StatCard label="Requisitions" value={stats.prs} icon="📋" onClick={() => setTab('pr')} />
          <StatCard label="Orders" value={stats.pos} icon="📦" onClick={() => { setTab('po'); setPoFilter('all') }} />
          <StatCard label="POs with GST" value={stats.posWithAllGst} icon="⚙️" onClick={() => { setTab('po'); setPoFilter('gst') }} />
        </div>
      </section>

      {/* ===== ACTIONS SECTION ===== */}
      <section className="dashboard-section">
        <h3 className="section-title">Actions</h3>

        <div className="dashboard-stats">
          <div
            className="stat-card-dashboard action-card"
            onClick={() => navigate('/app/reports')}
          >
            <div className="stat-icon">⬇️</div>
            <div className="stat-content">
              <div className="stat-name">Download Reports</div>
              <div className="stat-subtitle">Vendors · PR · PO</div>
            </div>
          </div>
        </div>
      </section>

      {/* ===== TABS SECTION ===== */}
      <section className="dashboard-section">
        <nav className="tabs">
          <button className={`tab ${tab === 'vendors' ? 'active' : ''}`} onClick={() => setTab('vendors')}>Vendors</button>
          <button className={`tab ${tab === 'pr' ? 'active' : ''}`} onClick={() => setTab('pr')}>Requisitions</button>
          <button className={`tab ${tab === 'po' ? 'active' : ''}`} onClick={() => { setTab('po'); setPoFilter('all') }}>Orders</button>
          {hasRole('ADMIN') && (
            <button className={`tab ${tab === 'users' ? 'active' : ''}`} onClick={() => setTab('users')}>Users</button>
          )}
        </nav>

        <div className="tab-panels">
          {tab === 'vendors' && <VendorsPage />}
          {tab === 'pr' && <PRPage />}
          {tab === 'po' && <POPage filter={poFilter} onFilterChange={setPoFilter} />}
          {tab === 'users' && hasRole('ADMIN') && <UsersPage />}
        </div>
      </section>

    </section>
  )
}

/* ===== SMALL REUSABLE CARD COMPONENT ===== */
function StatCard({ label, value, icon, onClick }) {
  return (
    <div className="stat-card-dashboard" onClick={onClick}>
      <div className="stat-icon">{icon}</div>
      <div className="stat-content">
        <div className="stat-value">{value}</div>
        <div className="stat-name">{label}</div>
      </div>
    </div>
  )
}
