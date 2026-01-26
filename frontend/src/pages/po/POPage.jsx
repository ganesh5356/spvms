import { useEffect, useState } from 'react'
import { useAuth } from '../../auth/AuthContext.jsx'
import { createClient } from '../../api/client.js'
import { extractErrorMessage } from '../../utils/errorHandler.js'
import Modal from '../../components/Modal.jsx'

export default function POPage({ filter = 'all', onFilterChange }) {
  const { token, hasRole } = useAuth()
  const client = createClient(() => token)
  const [pos, setPos] = useState([])
  const [approvedPrs, setApprovedPrs] = useState([])
  const [q, setQ] = useState({ page: 0, size: 10 })
  const [totalPages, setTotalPages] = useState(0)
  const [createData, setCreateData] = useState({ prId: '', cgstPercent: 9, sgstPercent: 9, igstPercent: 0 })
  const [createErrors, setCreateErrors] = useState({})
  const [createError, setCreateError] = useState('')
  const [closeError, setCloseError] = useState('')
  const [showCreate, setShowCreate] = useState(false)

  const filteredPos = filter === 'gst' ? pos.filter(p =>
    p.cgstAmount && p.cgstAmount > 0 &&
    p.sgstAmount && p.sgstAmount > 0 &&
    p.igstAmount && p.igstAmount > 0
  ) : pos

  function validateCreatePO(data) {
    const errors = {}
    if (!data.prId) errors.prId = 'PR ID is required'
    if (isNaN(Number(data.prId))) errors.prId = 'PR ID must be a number'
    if (data.cgstPercent === '' || data.cgstPercent === undefined) errors.cgstPercent = 'CGST is required'
    else if (Number(data.cgstPercent) < 1 || Number(data.cgstPercent) > 100) errors.cgstPercent = 'CGST must be between 1 and 100'
    if (data.sgstPercent === '' || data.sgstPercent === undefined) errors.sgstPercent = 'SGST is required'
    else if (Number(data.sgstPercent) < 1 || Number(data.sgstPercent) > 100) errors.sgstPercent = 'SGST must be between 1 and 100'
    if (data.igstPercent !== '' && data.igstPercent !== undefined && data.igstPercent !== null) {
      if (Number(data.igstPercent) < 0 || Number(data.igstPercent) > 100) errors.igstPercent = 'IGST must be between 0 and 100'
    }
    return errors
  }

  function validateClosePO(po) {
    const errors = {}
    if (po.status !== 'DELIVERED') {
      errors.status = 'PO can only be closed when status is DELIVERED'
    }
    return errors
  }

  async function load() {
    const params = new URLSearchParams()
    params.set('page', q.page)
    params.set('size', q.size)
    const res = await client.get(`/api/po?${params.toString()}`)
    const list = Array.isArray(res) ? res : (res && res.content) || []
    setPos(list)
    setCloseError('')
    if (res && res.totalPages != null) setTotalPages(res.totalPages)

    // Fetch approved PRs for dropdown
    try {
      const allPrs = await client.get('/api/pr')
      const approved = (Array.isArray(allPrs) ? allPrs : (allPrs.content || [])).filter(p => p.status === 'APPROVED')
      setApprovedPrs(approved)
    } catch (err) {
      console.error('Failed to fetch approved PRs', err)
    }
  }

  useEffect(() => {
    load()
    return () => {
      setCreateError('')
      setCloseError('')
      setCreateErrors({})
    }
  }, [])

  // Reload when pagination changes
  useEffect(() => { load() }, [q.page, q.size])

  async function createPo(e) {
    e.preventDefault()
    const errors = validateCreatePO(createData)
    if (Object.keys(errors).length > 0) {
      setCreateErrors(errors)
      return
    }
    setCreateErrors({})
    setCreateError('')
    try {
      await client.post(`/api/po/create/${Number(createData.prId)}?cgstPercent=${Number(createData.cgstPercent)}&sgstPercent=${Number(createData.sgstPercent)}&igstPercent=${Number(createData.igstPercent)}`, {})
      setCreateData({ prId: '', cgstPercent: 9, sgstPercent: 9, igstPercent: 0 })
      setShowCreate(false)
      await load()
    } catch (err) {
      const errorMsg = extractErrorMessage(err)
      setCreateError(` ${errorMsg}`)
    }
  }

  async function close(poId) {
    const po = pos.find(p => p.id === poId)
    const errors = validateClosePO(po)
    if (Object.keys(errors).length > 0) {
      setCloseError(` ${errors.status}`)
      return
    }
    setCloseError('')
    try {
      await client.post(`/api/po/${poId}/close`, {})
      await load()
    } catch (err) {
      const errorMsg = extractErrorMessage(err)
      setCloseError(` ${errorMsg}`)
    }
  }

  return (
    <div className="po-container">
      <header className="page-header">
        <h1 className="page-title">Purchase Orders {filter === 'gst' && '(With GST)'}</h1>
        <div style={{ display: 'flex', gap: 12 }}>
          {(hasRole('PROCUREMENT') || hasRole('ADMIN')) && (
            <button className="btn btn-primary" onClick={() => setShowCreate(true)}>+ Create PO</button>
          )}
        </div>
      </header>

      {closeError && <div className="error-banner">❌ {closeError}</div>}

      <div className="panel">
        <div className="panel-header">
          <h2 className="section-title">All Orders</h2>
        </div>
        <div className="table-wrap">
          <table className="table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Number</th>
                <th>Status</th>
                <th>Base Amt</th>
                <th>Total GST</th>
                <th>Grand Total</th>
                <th>Delivered</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredPos.map(po => (
                <tr key={po.id}>
                  <td>{po.id}</td>
                  <td><div style={{ fontWeight: 600 }}>{po.poNumber}</div></td>
                  <td>
                    <span className={`badge ${po.status === 'CLOSED' ? 'badge-success' :
                        po.status === 'DELIVERED' ? 'badge-info' : 'badge-warning'
                      }`}>
                      {po.status}
                    </span>
                  </td>
                  <td>{po.baseAmount?.toFixed(2)}</td>
                  <td>{po.totalGstAmount?.toFixed(2)}</td>
                  <td><div style={{ fontWeight: 700 }}>{po.totalAmount?.toFixed(2)}</div></td>
                  <td>{po.deliveredQuantity}</td>
                  <td>
                    {(hasRole('ADMIN') || hasRole('PROCUREMENT')) && (
                      <button className="btn btn-outline btn-small" onClick={() => close(po.id)}>Close</button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination Controls */}
        {totalPages > 1 && (
          <div className="pagination" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '20px', borderTop: '1px solid var(--border-color)' }}>
            <div>
              Showing {(q.page * q.size) + 1}-{Math.min((q.page + 1) * q.size, (q.page * q.size) + pos.length)} of {totalPages * q.size} POs
            </div>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button
                className="btn btn-outline btn-small"
                disabled={q.page === 0}
                onClick={() => setQ({ ...q, page: q.page - 1 })}
              >
                Previous
              </button>

              <span style={{ padding: '0 12px', lineHeight: '32px' }}>
                Page {q.page + 1} of {totalPages}
              </span>

              <button
                className="btn btn-outline btn-small"
                disabled={q.page === totalPages - 1}
                onClick={() => setQ({ ...q, page: q.page + 1 })}
              >
                Next
              </button>
            </div>

            <div>
              <select
                className="form-select"
                value={q.size}
                onChange={e => setQ({ ...q, size: parseInt(e.target.value), page: 0 })}
              >
                <option value="10">10 per page</option>
                <option value="20">20 per page</option>
                <option value="50">50 per page</option>
                <option value="100">100 per page</option>
              </select>
            </div>
          </div>
        )}
      </div>

      <Modal open={showCreate} title="Create Purchase Order" onClose={() => {
        setShowCreate(false)
        setCreateError('')
        setCreateErrors({})
      }}>
        <form className="form-grid" onSubmit={createPo}>
          <label className="form-label">
            <span>Approved PR</span>
            <select
              className="form-select"
              value={createData.prId}
              onChange={e => setCreateData({ ...createData, prId: e.target.value })}
              style={{ borderColor: createErrors.prId ? 'var(--danger)' : '' }}
              required
            >
              <option value="">-- Select Approved PR --</option>
              {approvedPrs.map(pr => (
                <option key={pr.id} value={pr.id}>{pr.prNumber} (Total: {pr.totalAmount})</option>
              ))}
            </select>
            {createErrors.prId && <span className="field-error">{createErrors.prId}</span>}
          </label>
          <label className="form-label"><span>CGST %</span><input className="form-input" type="number" min="0" max="100" step="0.01" value={createData.cgstPercent} onChange={e => setCreateData({ ...createData, cgstPercent: e.target.value })} style={{ borderColor: createErrors.cgstPercent ? 'var(--danger)' : '' }} required />{createErrors.cgstPercent && <span className="field-error">{createErrors.cgstPercent}</span>}</label>
          <label className="form-label"><span>SGST %</span><input className="form-input" type="number" min="0" max="100" step="0.01" value={createData.sgstPercent} onChange={e => setCreateData({ ...createData, sgstPercent: e.target.value })} style={{ borderColor: createErrors.sgstPercent ? 'var(--danger)' : '' }} required />{createErrors.sgstPercent && <span className="field-error">{createErrors.sgstPercent}</span>}</label>
          <label className="form-label"><span>IGST %</span><input className="form-input" type="number" min="0" max="100" step="0.01" value={createData.igstPercent} onChange={e => setCreateData({ ...createData, igstPercent: e.target.value })} style={{ borderColor: createErrors.igstPercent ? 'var(--danger)' : '' }} required />{createErrors.igstPercent && <span className="field-error">{createErrors.igstPercent}</span>}</label>
          <div className="modal-footer" style={{ gridColumn: '1 / -1' }}>
            <button type="button" className="btn btn-outline" onClick={() => setShowCreate(false)}>Cancel</button>
            <button className="btn btn-primary">Create PO</button>
          </div>
          {createError && <div className="error-banner" style={{ gridColumn: '1 / -1' }}>{createError}</div>}
        </form>
      </Modal>

    </div>
  )
}

