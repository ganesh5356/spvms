import { useEffect, useState } from 'react'
import { useAuth } from '../../auth/AuthContext.jsx'
import { createClient } from '../../api/client.js'
import { extractErrorMessage } from '../../utils/errorHandler.js'
import Modal from '../../components/Modal.jsx'

export default function POPage({ filter = 'all', onFilterChange }) {
  const { token } = useAuth()
  const client = createClient(() => token)
  const [pos, setPos] = useState([])
  const [createData, setCreateData] = useState({ prId: '', cgstPercent: 9, sgstPercent: 9, igstPercent: 0 })
  const [createErrors, setCreateErrors] = useState({})
  const [createError, setCreateError] = useState('')
  const [deliverData, setDeliverData] = useState({ poId: '', quantity: 1 })
  const [deliverErrors, setDeliverErrors] = useState({})
  const [deliverError, setDeliverError] = useState('')
  const [closeError, setCloseError] = useState('')
  const [showCreate, setShowCreate] = useState(false)
  const [showDeliver, setShowDeliver] = useState(false)

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

  function validateDeliver(data) {
    const errors = {}
    if (!data.poId) errors.poId = 'PO ID is required'
    if (isNaN(Number(data.poId))) errors.poId = 'PO ID must be a number'
    if (Number(data.quantity) < 1) errors.quantity = 'Quantity must be at least 1'
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
    const res = await client.get('/api/po')
    setPos(res)
    setCloseError('')
  }
  useEffect(() => { 
    load()
    return () => {
      setCreateError('')
      setDeliverError('')
      setCloseError('')
      setCreateErrors({})
      setDeliverErrors({})
    }
  }, [])

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
      setCreateData({ prId:'', cgstPercent:9, sgstPercent:9, igstPercent:0 })
      setShowCreate(false)
      await load()
    } catch (err) {
      const errorMsg = extractErrorMessage(err)
      setCreateError(`❌ ${errorMsg}`)
    }
  }
  async function deliver(e) {
    e.preventDefault()
    const errors = validateDeliver(deliverData)
    if (Object.keys(errors).length > 0) {
      setDeliverErrors(errors)
      return
    }
    setDeliverErrors({})
    setDeliverError('')
    try {
      await client.post(`/api/po/${Number(deliverData.poId)}/deliver?quantity=${Number(deliverData.quantity)}`, {})
      setDeliverData({ poId:'', quantity:1 })
      setShowDeliver(false)
      await load()
    } catch (err) {
      const errorMsg = extractErrorMessage(err)
      setDeliverError(`❌ ${errorMsg}`)
    }
  }
  async function close(poId) {
    const po = pos.find(p => p.id === poId)
    const errors = validateClosePO(po)
    if (Object.keys(errors).length > 0) {
      setCloseError(`❌ ${errors.status}`)
      return
    }
    setCloseError('')
    try {
      await client.post(`/api/po/${poId}/close`, {})
      await load()
    } catch (err) {
      const errorMsg = extractErrorMessage(err)
      setCloseError(`❌ ${errorMsg}`)
    }
  }

  return (
    <div className="panel">
      <div className="panel-header">
        <h3>Purchase Orders {filter === 'gst' && '(With All GST)'}</h3>
        <div style={{display:'flex',gap:8}}>
          <button className="btn" onClick={() => setShowCreate(true)}>Create PO</button>
          <button className="btn outline" onClick={() => setShowDeliver(true)}>Deliver</button>
        </div>
      </div>
      <div className="table-wrap">
        <table className="table">
          <thead>
            <tr><th>ID</th><th>Number</th><th>Status</th><th>Base Amount</th><th>CGST</th><th>SGST</th><th>IGST</th><th>Total GST</th><th>Total</th><th>Delivered</th><th>Actions</th></tr>
          </thead>
          <tbody>
            {filteredPos.map(po => (
              <tr key={po.id}>
                <td>{po.id}</td>
                <td>{po.poNumber}</td>
                <td>{po.status}</td>
                <td>{po.baseAmount?.toFixed(2) || '0.00'}</td>
                <td>{po.cgstAmount?.toFixed(2) || '0.00'}</td>
                <td>{po.sgstAmount?.toFixed(2) || '0.00'}</td>
                <td>{po.igstAmount?.toFixed(2) || '0.00'}</td>
                <td>{po.totalGstAmount?.toFixed(2) || '0.00'}</td>
                <td>{po.totalAmount?.toFixed(2) || '0.00'}</td>
                <td>{po.deliveredQuantity}</td>
                <td>
                  <button className="btn small" onClick={() => close(po.id)}>Close</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {closeError && <div className="error" style={{marginTop:12}}>{closeError}</div>}

      <Modal open={showCreate} title="Create Purchase Order" onClose={() => {
        setShowCreate(false)
        setCreateError('')
        setCreateErrors({})
      }}>
        <form className="form-grid" onSubmit={createPo}>
          <label><span>PR ID</span><input value={createData.prId} onChange={e=>setCreateData({...createData,prId:e.target.value})} style={{borderColor: createErrors.prId ? '#dc2626' : ''}} required />{createErrors.prId && <span className="field-error">{createErrors.prId}</span>}</label>
          <label><span>CGST %</span><input type="number" min="0" max="100" step="0.01" value={createData.cgstPercent} onChange={e=>setCreateData({...createData,cgstPercent:e.target.value})} style={{borderColor: createErrors.cgstPercent ? '#dc2626' : ''}} required />{createErrors.cgstPercent && <span className="field-error">{createErrors.cgstPercent}</span>}</label>
          <label><span>SGST %</span><input type="number" min="0" max="100" step="0.01" value={createData.sgstPercent} onChange={e=>setCreateData({...createData,sgstPercent:e.target.value})} style={{borderColor: createErrors.sgstPercent ? '#dc2626' : ''}} required />{createErrors.sgstPercent && <span className="field-error">{createErrors.sgstPercent}</span>}</label>
          <label><span>IGST %</span><input type="number" min="0" max="100" step="0.01" value={createData.igstPercent} onChange={e=>setCreateData({...createData,igstPercent:e.target.value})} style={{borderColor: createErrors.igstPercent ? '#dc2626' : ''}} required />{createErrors.igstPercent && <span className="field-error">{createErrors.igstPercent}</span>}</label>
          <div className="modal-actions">
            <button className="btn primary">Create PO</button>
            <button type="button" className="btn outline" onClick={() => setShowCreate(false)}>Cancel</button>
          </div>
          {createError && <div className="error">{createError}</div>}
        </form>
      </Modal>

      <Modal open={showDeliver} title="Deliver Purchase Order" onClose={() => {
        setShowDeliver(false)
        setDeliverError('')
        setDeliverErrors({})
      }}>
        <form className="form-grid" onSubmit={deliver}>
          <label><span>PO ID</span><input value={deliverData.poId} onChange={e=>setDeliverData({...deliverData,poId:e.target.value})} style={{borderColor: deliverErrors.poId ? '#dc2626' : ''}} required />{deliverErrors.poId && <span className="field-error">{deliverErrors.poId}</span>}</label>
          <label><span>Quantity</span><input type="number" min="1" value={deliverData.quantity} onChange={e=>setDeliverData({...deliverData,quantity:e.target.value})} style={{borderColor: deliverErrors.quantity ? '#dc2626' : ''}} required />{deliverErrors.quantity && <span className="field-error">{deliverErrors.quantity}</span>}</label>
          <div className="modal-actions">
            <button className="btn primary">Deliver</button>
            <button type="button" className="btn outline" onClick={() => setShowDeliver(false)}>Cancel</button>
          </div>
          {deliverError && <div className="error">{deliverError}</div>}
        </form>
      </Modal>
    </div>
  )
}
