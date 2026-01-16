import { useEffect, useState } from 'react'
import { useAuth } from '../../auth/AuthContext.jsx'
import { createClient } from '../../api/client.js'
import { extractErrorMessage } from '../../utils/errorHandler.js'
import Modal from '../../components/Modal.jsx'

export default function PRPage() {
  const { token } = useAuth()
  const client = createClient(() => token)
  const [prs, setPrs] = useState([])
  const [form, setForm] = useState({
    requesterId: '', vendorId: '', items: ['Item'], quantities: [1], itemAmounts: [1]
  })
  const [fieldErrors, setFieldErrors] = useState({})
  const [error, setError] = useState('')
  const [approvalError, setApprovalError] = useState('')
  const [history, setHistory] = useState([])
  const [selectedId, setSelectedId] = useState(null)
  const [showCreate, setShowCreate] = useState(false)

  function validatePR(prForm) {
    const errors = {}
    if (!prForm.requesterId) errors.requesterId = 'Requester ID is required'
    if (isNaN(Number(prForm.requesterId))) errors.requesterId = 'Requester ID must be a number'
    if (!prForm.vendorId) errors.vendorId = 'Vendor ID is required'
    if (isNaN(Number(prForm.vendorId))) errors.vendorId = 'Vendor ID must be a number'
    if (!prForm.items[0]?.trim()) errors.items = 'Item name is required'
    if (prForm.quantities[0] < 1) errors.quantities = 'Quantity must be at least 1'
    if (prForm.itemAmounts[0] < 1) errors.itemAmounts = 'Amount must be at least 1'
    return errors
  }

  function validatePRAction(pr, action) {
    const errors = {}
    if (action === 'submit' && (pr.status !== 'DRAFT' && pr.status !== 'PENDING')) {
      errors.status = 'PR can only be submitted from DRAFT or PENDING status'
    }
    if (action === 'approve' && pr.status !== 'SUBMITTED') {
      errors.status = 'PR must be submitted before approval'
    }
    if (action === 'reject' && (pr.status !== 'SUBMITTED' && pr.status !== 'APPROVED')) {
      errors.status = 'PR can only be rejected from SUBMITTED or APPROVED status'
    }
    return errors
  }

  async function load() {
    const res = await client.get('/api/pr')
    setPrs(res)
  }
  useEffect(() => { 
    load()
    return () => {
      setError('')
      setApprovalError('')
      setFieldErrors({})
    }
  }, [])

  async function createPr(e) {
    e.preventDefault()
    const errors = validatePR(form)
    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors)
      return
    }
    setFieldErrors({})
    setError('')
    try {
      const payload = {
        requesterId: Number(form.requesterId),
        vendorId: Number(form.vendorId),
        items: form.items,
        quantities: form.quantities.map(x=>Number(x)),
        itemAmounts: form.itemAmounts.map(x=>Number(x))
      }
      await client.post('/api/pr', payload)
      setForm({ requesterId:'', vendorId:'', items:['Item'], quantities:[1], itemAmounts:[1] })
      setShowCreate(false)
      await load()
    } catch (err) {
      const errorMsg = extractErrorMessage(err)
      setError(`❌ ${errorMsg}`)
    }
  }

  async function submit(id) {
    const pr = prs.find(p => p.id === id)
    const errors = validatePRAction(pr, 'submit')
    if (Object.keys(errors).length > 0) {
      setApprovalError(`❌ ${errors.status}`)
      return
    }
    setApprovalError('')
    try {
      await client.post(`/api/pr/${id}/submit`, {})
      await load()
    } catch (err) {
      const errorMsg = extractErrorMessage(err)
      setApprovalError(`❌ ${errorMsg}`)
    }
  }
  async function approve(id) {
    const pr = prs.find(p => p.id === id)
    const errors = validatePRAction(pr, 'approve')
    if (Object.keys(errors).length > 0) {
      setApprovalError(`❌ ${errors.status}`)
      return
    }
    setApprovalError('')
    try {
      await client.post(`/api/pr/${id}/approve?comments=Approved&approverId=1`, {})
      await load()
    } catch (err) {
      const errorMsg = extractErrorMessage(err)
      setApprovalError(`❌ ${errorMsg}`)
    }
  }
  async function reject(id) {
    const pr = prs.find(p => p.id === id)
    const errors = validatePRAction(pr, 'reject')
    if (Object.keys(errors).length > 0) {
      setApprovalError(`❌ ${errors.status}`)
      return
    }
    setApprovalError('')
    try {
      await client.post(`/api/pr/${id}/reject?comments=Rejected&approverId=1`, {})
      await load()
    } catch (err) {
      const errorMsg = extractErrorMessage(err)
      setApprovalError(`❌ ${errorMsg}`)
    }
  }

  async function openHistory(id) {
    setSelectedId(id)
    setApprovalError('')
    try {
      const res = await client.get(`/api/pr/${id}/history`)
      setHistory(res)
    } catch {
      setHistory([])
    }
  }

  return (
    <div className="panel">
      <div className="panel-header">
        <h3>Purchase Requisitions</h3>
        <button className="btn" onClick={() => setShowCreate(true)}>Create PR</button>
      </div>
      <div className="table-wrap">
        <table className="table">
          <thead>
            <tr><th>ID</th><th>Number</th><th>Status</th><th>Vendor</th><th>Total</th><th>Actions</th></tr>
          </thead>
          <tbody>
            {prs.map(pr => (
              <tr key={pr.id}>
                <td>{pr.id}</td><td>{pr.prNumber}</td><td>{pr.status}</td><td>{pr.vendorId}</td><td>{pr.totalAmount}</td>
                <td>
                  <div style={{display:'flex', gap:'8px'}}>
                    <button className="btn small" onClick={() => submit(pr.id)}>Submit</button>
                    <button className="btn small" onClick={() => approve(pr.id)}>Approve</button>
                    <button className="btn outline small" onClick={() => reject(pr.id)}>Reject</button>
                    <button className="btn outline small" onClick={() => openHistory(pr.id)}>History</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {approvalError && <div className="error" style={{marginTop:12}}>{approvalError}</div>}

      <Modal open={showCreate} title="Create Requisition" onClose={() => {
        setShowCreate(false)
        setError('')
        setFieldErrors({})
      }}>
        <form className="form-grid" onSubmit={createPr}>
          <label><span>Requester ID</span><input value={form.requesterId} onChange={e=>setForm({...form, requesterId:e.target.value})} style={{borderColor: fieldErrors.requesterId ? '#dc2626' : ''}} required />{fieldErrors.requesterId && <span className="field-error">{fieldErrors.requesterId}</span>}</label>
          <label><span>Vendor ID</span><input value={form.vendorId} onChange={e=>setForm({...form, vendorId:e.target.value})} style={{borderColor: fieldErrors.vendorId ? '#dc2626' : ''}} required />{fieldErrors.vendorId && <span className="field-error">{fieldErrors.vendorId}</span>}</label>
          <label><span>Item</span><input value={form.items[0]} onChange={e=>setForm({...form, items:[e.target.value]})} style={{borderColor: fieldErrors.items ? '#dc2626' : ''}} required />{fieldErrors.items && <span className="field-error">{fieldErrors.items}</span>}</label>
          <label><span>Quantity</span><input type="number" min="1" value={form.quantities[0]} onChange={e=>setForm({...form, quantities:[e.target.value]})} style={{borderColor: fieldErrors.quantities ? '#dc2626' : ''}} required />{fieldErrors.quantities && <span className="field-error">{fieldErrors.quantities}</span>}</label>
          <label><span>Amount</span><input type="number" min="1" value={form.itemAmounts[0]} onChange={e=>setForm({...form, itemAmounts:[e.target.value]})} style={{borderColor: fieldErrors.itemAmounts ? '#dc2626' : ''}} required />{fieldErrors.itemAmounts && <span className="field-error">{fieldErrors.itemAmounts}</span>}</label>
          <div className="modal-actions">
            <button className="btn primary">Create PR</button>
            <button type="button" className="btn outline" onClick={() => setShowCreate(false)}>Cancel</button>
          </div>
          {error && <div className="error">{error}</div>}
        </form>
      </Modal>
      {selectedId && (
        <div className="table-wrap" style={{marginTop:12}}>
          <table className="table">
            <thead>
              <tr><th>Action</th><th>Approver</th><th>Comments</th><th>Time</th></tr>
            </thead>
            <tbody>
              {history.map(h => (
                <tr key={h.id}>
                  <td>{h.action}</td>
                  <td>{h.approverId}</td>
                  <td>{h.comments}</td>
                  <td>{h.actionAt}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
