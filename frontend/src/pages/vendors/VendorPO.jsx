import { useEffect, useState } from 'react'
import { useAuth } from '../../auth/AuthContext.jsx'
import { createClient } from '../../api/client.js'
import { extractErrorMessage } from '../../utils/errorHandler.js'
import Modal from '../../components/Modal.jsx'

export default function VendorPO() {
  const { token } = useAuth()
  const client = createClient(() => token)
  const [pos, setPos] = useState([])
  const [error, setError] = useState('')
  
  const [showDeliver, setShowDeliver] = useState(false)
  const [deliverData, setDeliverData] = useState({ poId: '', quantity: 1 })
  const [deliverError, setDeliverError] = useState('')
  const [deliverErrors, setDeliverErrors] = useState({})

  async function load() {
    try {
      const vendorId = await client.get('/api/vendors/me/id')
      const data = await client.get(`/api/po/by-vendor/${vendorId}`)
      setPos(data)
    } catch (err) {
      setError(extractErrorMessage(err))
    }
  }

  useEffect(() => { load() }, [])

  function openDeliverModal(poId) {
    setDeliverData({ poId, quantity: 1 })
    setShowDeliver(true)
  }

  async function handleDeliver(e) {
    e.preventDefault()
    setDeliverError('')
    setDeliverErrors({})

    // Find the PO to validate against remaining quantity
    const po = pos.find(p => p.id === deliverData.poId)
    
    if (deliverData.quantity < 1) {
      setDeliverErrors({ quantity: 'Quantity must be at least 1' })
      return
    }
    
    if (deliverData.quantity > po.remainingQuantity) {
      setDeliverErrors({ quantity: `Cannot deliver more than remaining quantity (${po.remainingQuantity})` })
      return
    }

    try {
      await client.post(`/api/po/${deliverData.poId}/deliver?quantity=${deliverData.quantity}`, {})
      setShowDeliver(false)
      load()
    } catch (err) {
      setDeliverError(extractErrorMessage(err))
    }
  }

  async function downloadInvoice(poId) {
    try {
      const response = await fetch(`/api/po/${poId}/invoice`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (!response.ok) throw new Error('Failed to download invoice')

      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `Invoice_PO_${poId}.pdf`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(url)
    } catch (err) {
      setError('Failed to download invoice')
    }
  }

  if (error) return <div className="error-banner"> {error}</div>

  return (
    <div className="vendor-po-container">
      <header className="page-header">
        <h1 className="page-title">Assigned Purchase Orders</h1>
      </header>

      <div className="panel">
        <div className="panel-header">
          <h2 className="section-title">Order History</h2>
        </div>
        <div className="table-wrap">
          <table className="table">
            <thead>
              <tr>
                <th>PO Number</th>
                <th>Status</th>
                <th>Total Amount</th>
                <th>Delivered</th>
                <th>Remaining</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {pos.length > 0 ? pos.map(po => (
                <tr key={po.id}>
                  <td><div style={{ fontWeight: 600 }}>{po.poNumber}</div></td>
                  <td>
                    <span className={`badge ${
                      po.status === 'CLOSED' ? 'badge-success' : 
                      po.status === 'DELIVERED' ? 'badge-info' : 'badge-warning'
                    }`}>
                      {po.status}
                    </span>
                  </td>
                  <td>{po.totalAmount?.toFixed(2)}</td>
                  <td>{po.deliveredQuantity} / {po.totalQuantity}</td>
                  <td>{po.remainingQuantity}</td>
                  <td>
                    <div style={{ display: 'flex', gap: 8 }}>
                      {po.status !== 'CLOSED' && po.remainingQuantity > 0 && (
                        <button className="btn btn-primary btn-small" onClick={() => openDeliverModal(po.id)}>Deliver</button>
                      )}
                      {po.status === 'DELIVERED' && po.remainingQuantity === 0 && (
                        <button 
                          className="btn btn-outline btn-small" 
                          onClick={() => downloadInvoice(po.id)} 
                          style={{ color: 'var(--success)', borderColor: 'var(--success)' }}
                        >
                          📥 Download Invoice
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              )) : (
                <tr><td colSpan="6" style={{ textAlign: 'center', padding: '32px', color: 'var(--text-muted)' }}>No purchase orders assigned yet.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <Modal open={showDeliver} title="Deliver Items" onClose={() => setShowDeliver(false)}>
        <form className="form-grid" onSubmit={handleDeliver}>
          <div style={{ gridColumn: '1 / -1' }}>
            <p style={{ marginBottom: '16px', fontSize: '14px', color: 'var(--text-muted)' }}>
              Enter the quantity you are delivering for PO ID: <strong>{deliverData.poId}</strong>
            </p>
            <p style={{ marginBottom: '16px', fontSize: '14px', color: 'var(--text-info)' }}>
              Remaining quantity to deliver: <strong>{pos.find(p => p.id === deliverData.poId)?.remainingQuantity || 0}</strong>
            </p>
          </div>
          <label className="form-label" style={{ gridColumn: '1 / -1' }}>
            <span>Quantity to Deliver</span>
            <input 
              className="form-input" 
              type="number" 
              min="1" 
              max={pos.find(p => p.id === deliverData.poId)?.remainingQuantity || 1}
              value={deliverData.quantity} 
              onChange={e => setDeliverData({...deliverData, quantity: parseInt(e.target.value) || 0})}
              required 
              style={{ borderColor: deliverErrors.quantity ? 'var(--danger)' : '' }}
            />
            {deliverErrors.quantity && <span className="field-error">{deliverErrors.quantity}</span>}
          </label>
          <div className="modal-footer" style={{ gridColumn: '1 / -1', marginTop: '12px' }}>
            <button type="button" className="btn btn-outline" onClick={() => setShowDeliver(false)}>Cancel</button>
            <button type="submit" className="btn btn-primary">Submit Delivery</button>
          </div>
          {deliverError && <div className="error-banner" style={{ gridColumn: '1 / -1' }}>{deliverError}</div>}
        </form>
      </Modal>
    </div>
  )
}
