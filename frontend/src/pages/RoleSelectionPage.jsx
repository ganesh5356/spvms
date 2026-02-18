import { useState, useEffect } from 'react'
import { useAuth } from '../auth/AuthContext.jsx'
import { createClient } from '../api/client.js'
import { useNavigate } from 'react-router-dom'

export default function RoleSelectionPage() {
    const { token, logout } = useAuth()
    const client = createClient(() => token)

    const [selectedRole, setSelectedRole] = useState('')
    const [formData, setFormData] = useState({
        fullName: '',
        email: '',
        phone: '',
        location: '',
        category: '',
        gstNumber: '',
        address: '',
        rating: '5.0',
        details: ''
    })
    const [file, setFile] = useState(null)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')
    const [myRequest, setMyRequest] = useState(null)

    useEffect(() => {
        async function checkMyRequest() {
            try {
                const req = await client.get('/api/role-requests/my-request')
                if (req) {
                    setMyRequest(req)
                }
            } catch (err) {
                console.error('Failed to fetch my request', err)
            }
        }
        checkMyRequest()
    }, [])

    const handleChange = (e) => {
        const { name, value } = e.target
        setFormData(prev => ({ ...prev, [name]: value }))
    }

    const validateForm = () => {
        if (!formData.fullName.trim()) return 'Full Name is required';
        if (!formData.email.trim()) return 'Email is required';
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) return 'Invalid email format';

        // India 10-digit mobile number validation
        if (!formData.phone.trim()) return 'Phone Number is required';
        if (!/^[6-9]\d{9}$/.test(formData.phone)) return 'Phone number must be a valid 10-digit Indian mobile number (e.g., 9876543210)';

        if (selectedRole === 'VENDOR') {
            if (!formData.location.trim() || formData.location.length < 2) return 'Location must be at least 2 characters';
            if (!formData.category.trim() || formData.category.length < 2) return 'Category must be at least 2 characters';
            if (!formData.address.trim() || formData.address.length < 5) return 'Address must be at least 5 characters';

            // Indian GST validation
            const gstPattern = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/;
            if (!formData.gstNumber.trim()) return 'GST Number is required';
            if (!gstPattern.test(formData.gstNumber)) return 'Invalid GST number format (e.g., 29ABCDE1234F1Z5)';

            const r = parseFloat(formData.rating);
            if (isNaN(r) || r < 1.0 || r > 5.0) return 'Rating must be between 1.0 and 5.0';
        }

        if (!file) return 'Please upload the required document';

        return null;
    }

    const handleSubmit = async (e) => {
        e.preventDefault()

        if (!selectedRole) {
            setError('Please select a role');
            return;
        }

        const validationError = validateForm();
        if (validationError) {
            setError(validationError);
            return;
        }

        setLoading(true)
        setError('')

        const data = new FormData()
        data.append('role', selectedRole || '')
        data.append('fullName', formData.fullName || '')
        data.append('email', formData.email || '')
        data.append('phone', formData.phone || '')
        data.append('details', formData.details || '')

        if (selectedRole === 'VENDOR') {
            data.append('location', formData.location || '')
            data.append('category', formData.category || '')
            data.append('gstNumber', formData.gstNumber || '')
            data.append('address', formData.address || '')
            data.append('rating', formData.rating || '5.0')
        }

        data.append('file', file)

        console.log('Submitting role request:', Object.fromEntries(data.entries()));

        try {
            const res = await client.postFormData('/api/role-requests', data)
            setMyRequest(res)
        } catch (err) {
            const errorMsg = err.data?.message || (typeof err.data === 'string' ? err.data : JSON.stringify(err.data)) || 'Failed to submit request';
            setError(errorMsg);
        } finally {
            setLoading(false)
        }
    }

    if (myRequest && myRequest.status === 'PENDING') {
        return (
            <div className="role-selection-container">
                <div className="panel" style={{ maxWidth: '600px', margin: '50px auto', textAlign: 'center' }}>
                    <div className="panel-header">
                        <h2 className="section-title">Request Pending</h2>
                    </div>
                    <div className="panel-body">
                        <div className="status-badge badge-info" style={{ marginBottom: '20px' }}>PENDING REVIEW</div>
                        <p>Your request for the <strong>{myRequest.requestedRole}</strong> role has been submitted and is currently being reviewed by an administrator.</p>
                        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>You will gain access to the system once your request is approved.</p>
                        <button className="btn btn-secondary" onClick={() => logout()} style={{ marginTop: '20px' }}>Logout</button>
                    </div>
                </div>
            </div>
        )
    }

    const renderRoleForm = () => {
        const isVendorRole = selectedRole === 'VENDOR';
        const documentLabel = isVendorRole ? "Government Identity Proof (JPG)" : "Approval Documentation (JPG)";

        return (
            <div className="premium-form-card animate-fade-in" style={{
                maxWidth: '850px',
                margin: '0 auto',
                background: 'var(--panel)',
                borderRadius: '24px',
                boxShadow: '0 20px 50px rgba(0,0,0,0.1)',
                overflow: 'hidden',
                border: 'none',
                position: 'relative'
            }}>
                <div style={{
                    background: 'linear-gradient(135deg, var(--primary) 0%, #4f46e5 100%)',
                    padding: '40px 30px',
                    color: 'white',
                    textAlign: 'center',
                    position: 'relative'
                }}>
                    <button onClick={() => setSelectedRole('')} style={{
                        position: 'absolute',
                        left: '24px',
                        top: '24px',
                        background: 'rgba(255,255,255,0.15)',
                        border: 'none',
                        color: 'white',
                        padding: '8px 16px',
                        borderRadius: '12px',
                        cursor: 'pointer',
                        fontSize: '0.85rem',
                        fontWeight: 600,
                        backdropFilter: 'blur(10px)',
                        transition: 'all 0.2s'
                    }}>← Change Role</button>

                    <div style={{ fontSize: '3rem', marginBottom: '16px' }}>
                        {selectedRole === 'ADMIN' && '🛡️'}
                        {selectedRole === 'PROCUREMENT' && '🛒'}
                        {selectedRole === 'FINANCE' && '💰'}
                        {selectedRole === 'VENDOR' && '🏢'}
                    </div>
                    <h2 style={{ margin: 0, fontSize: '1.8rem', fontWeight: 800, letterSpacing: '-0.5px', color: 'white' }}>
                        {selectedRole} Application Profile
                    </h2>
                    <p style={{ margin: '12px 0 0', opacity: 0.9, fontSize: '1rem' }}>
                        Provide your professional credentials for verification.
                    </p>
                </div>

                <div style={{ padding: '40px' }}>
                    <form onSubmit={handleSubmit}>
                        {/* SECTION 1: Personal & Contact */}
                        <div style={{ marginBottom: '40px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px', borderBottom: '2px solid #f3f4f6', paddingBottom: '12px' }}>
                                <span style={{ fontSize: '1.4rem' }}>👤</span>
                                <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-main)' }}>Contact Information</h3>
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
                                <div className="form-group">
                                    <label style={{ fontWeight: 600, fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '8px', display: 'block', textTransform: 'uppercase' }}>Full Legal Name</label>
                                    <input type="text" name="fullName" className="form-control" placeholder="e.g. John Doe" value={formData.fullName} onChange={handleChange} required style={{ borderRadius: '12px', padding: '12px' }} />
                                </div>
                                <div className="form-group">
                                    <label style={{ fontWeight: 600, fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '8px', display: 'block', textTransform: 'uppercase' }}>Professional Email</label>
                                    <input type="email" name="email" className="form-control" placeholder="john.doe@company.com" value={formData.email} onChange={handleChange} required style={{ borderRadius: '12px', padding: '12px' }} />
                                </div>
                                <div className="form-group" style={{ gridColumn: 'span 2' }}>
                                    <label style={{ fontWeight: 600, fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '8px', display: 'block', textTransform: 'uppercase' }}>Active Mobile Number</label>
                                    <input type="text" name="phone" className="form-control" placeholder="+91 XXXXX XXXXX" value={formData.phone} onChange={handleChange} required style={{ borderRadius: '12px', padding: '12px' }} />
                                </div>
                            </div>
                        </div>

                        {/* SECTION 2: Role Specific Meta */}
                        {isVendorRole && (
                            <div style={{ marginBottom: '40px' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px', borderBottom: '2px solid #f3f4f6', paddingBottom: '12px' }}>
                                    <span style={{ fontSize: '1.4rem' }}>🏬</span>
                                    <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-main)' }}>Organization Credentials</h3>
                                </div>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
                                    <div className="form-group">
                                        <label style={{ fontWeight: 600, fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '8px', display: 'block', textTransform: 'uppercase' }}>GST Identification Number</label>
                                        <input type="text" name="gstNumber" className="form-control" placeholder="29XXXXX1234F1Z5" value={formData.gstNumber} onChange={handleChange} required style={{ borderRadius: '12px', padding: '12px' }} />
                                    </div>
                                    <div className="form-group">
                                        <label style={{ fontWeight: 600, fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '8px', display: 'block', textTransform: 'uppercase' }}>Industry Category</label>
                                        <input type="text" name="category" className="form-control" placeholder="e.g. Technology Solutions" value={formData.category} onChange={handleChange} required style={{ borderRadius: '12px', padding: '12px' }} />
                                    </div>
                                    <div className="form-group">
                                        <label style={{ fontWeight: 600, fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '8px', display: 'block', textTransform: 'uppercase' }}>Corporate Location</label>
                                        <input type="text" name="location" className="form-control" placeholder="City, State" value={formData.location} onChange={handleChange} required style={{ borderRadius: '12px', padding: '12px' }} />
                                    </div>
                                    <div className="form-group">
                                        <label style={{ fontWeight: 600, fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '8px', display: 'block', textTransform: 'uppercase' }}>Vendor Trust Rating (1-5)</label>
                                        <input type="number" step="0.1" min="1" max="5" name="rating" className="form-control" value={formData.rating} onChange={handleChange} required style={{ borderRadius: '12px', padding: '12px' }} />
                                    </div>
                                    <div className="form-group" style={{ gridColumn: 'span 2' }}>
                                        <label style={{ fontWeight: 600, fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '8px', display: 'block', textTransform: 'uppercase' }}>Registered Business Address</label>
                                        <textarea name="address" className="form-control" placeholder="Complete office or factory address..." value={formData.address} onChange={handleChange} required rows="3" style={{ borderRadius: '12px', padding: '12px', resize: 'none' }}></textarea>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* SECTION 3: Documentation Checklist */}
                        <div style={{ marginBottom: '40px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px', borderBottom: '2px solid #f3f4f6', paddingBottom: '12px' }}>
                                <span style={{ fontSize: '1.4rem' }}>📄</span>
                                <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-main)' }}>Compliance Documentation</h3>
                            </div>
                            <div style={{
                                padding: '30px',
                                border: '2px dashed #e5e7eb',
                                borderRadius: '16px',
                                textAlign: 'center',
                                backgroundColor: '#f9fafb'
                            }}>
                                <label style={{ display: 'block', fontWeight: 600, fontSize: '0.9rem', marginBottom: '16px' }}>{documentLabel}</label>
                                <input type="file" className="form-control" accept=".jpg,.jpeg" onChange={(e) => setFile(e.target.files[0])} required />
                                {file && <p style={{ marginTop: '12px', color: 'var(--success)', fontWeight: 600 }}>✓ {file.name} attached.</p>}
                            </div>
                        </div>

                        {/* SECTION 4: Finalization */}
                        <div style={{ marginBottom: '40px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px', borderBottom: '2px solid #f3f4f6', paddingBottom: '12px' }}>
                                <span style={{ fontSize: '1.4rem' }}>ℹ️</span>
                                <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-main)' }}>Additional Context</h3>
                            </div>
                            <textarea name="details" className="form-control" placeholder="Any additional notes for the reviewers..." value={formData.details} onChange={handleChange} rows="2" style={{ borderRadius: '12px', padding: '12px', resize: 'none' }}></textarea>
                        </div>

                        {error && (
                            <div className="alert alert-danger animate-shake" style={{ borderRadius: '12px', padding: '16px', display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '30px', border: 'none', backgroundColor: '#fff1f2', color: '#991b1b' }}>
                                <span>⚠️</span> {error}
                            </div>
                        )}

                        <div style={{ display: 'flex', gap: '16px' }}>
                            <button type="submit" className="btn btn-primary" disabled={loading} style={{
                                padding: '16px 40px',
                                borderRadius: '12px',
                                fontWeight: 700,
                                fontSize: '1rem',
                                flex: 1,
                                boxShadow: '0 4px 12px rgba(37, 99, 235, 0.2)'
                            }}>
                                {loading ? 'Processing Application...' : 'Submit Profile for Verification'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        );
    };

    return (
        <div className="role-selection-wrapper" style={{
            minHeight: '100vh',
            backgroundColor: '#f8fafc',
            padding: '60px 20px',
            backgroundImage: 'radial-gradient(at 0% 0%, rgba(37, 99, 235, 0.05) 0, transparent 50%), radial-gradient(at 100% 100%, rgba(79, 70, 229, 0.05) 0, transparent 50%)'
        }}>
            <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
                {!selectedRole ? (
                    <>
                        <header style={{ textAlign: 'center', marginBottom: '60px' }}>
                            <h1 style={{ fontSize: '2.5rem', fontWeight: 800, color: 'var(--text-main)', marginBottom: '16px', letterSpacing: '-1px' }}>Welcome to SPVMS</h1>
                            <p style={{ fontSize: '1.1rem', color: 'var(--text-muted)', maxWidth: '600px', margin: '0 auto' }}>
                                To begin, please select your professional designation within the procurement ecosystem.
                            </p>
                        </header>

                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '24px' }}>
                            {[
                                { id: 'ADMIN', icon: '🛡️', title: 'Administrator', desc: 'System governance and oversight' },
                                { id: 'PROCUREMENT', icon: '🛒', title: 'Procurement', desc: 'Requisitions and sourcing' },
                                { id: 'FINANCE', icon: '💰', title: 'Finance', desc: 'Orders and fiscal reporting' },
                                { id: 'VENDOR', icon: '🏢', title: 'Vendor Partner', desc: 'Goods and services delivery' }
                            ].map(role => (
                                <div
                                    key={role.id}
                                    onClick={() => setSelectedRole(role.id)}
                                    className="premium-role-card"
                                    style={{
                                        background: 'white',
                                        padding: '35px 25px',
                                        borderRadius: '24px',
                                        textAlign: 'center',
                                        cursor: 'pointer',
                                        border: '2px solid transparent',
                                        boxShadow: '0 10px 30px rgba(0,0,0,0.05)',
                                        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
                                    }}
                                >
                                    <div style={{ fontSize: '3rem', marginBottom: '20px' }}>{role.icon}</div>
                                    <h3 style={{ margin: '0 0 10px', fontSize: '1.2rem', fontWeight: 700 }}>{role.title}</h3>
                                    <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-muted)', lineHeight: 1.5 }}>{role.desc}</p>
                                    <div style={{ marginTop: '20px', color: 'var(--primary)', fontWeight: 700, fontSize: '0.8rem' }}>SELECT →</div>
                                </div>
                            ))}
                        </div>
                    </>
                ) : (
                    renderRoleForm()
                )}

                <div style={{ textAlign: 'center', marginTop: '60px' }}>
                    <button onClick={logout} style={{
                        background: 'none',
                        border: 'none',
                        color: 'var(--text-muted)',
                        fontSize: '0.9rem',
                        fontWeight: 600,
                        cursor: 'pointer',
                        textDecoration: 'underline'
                    }}>Sign Out of System</button>
                </div>
            </div>

            <style>{`
                .premium-role-card:hover {
                    transform: translateY(-10px);
                    border-color: var(--primary) !important;
                    box-shadow: 0 20px 40px rgba(37, 99, 235, 0.1) !important;
                }
                .form-control:focus {
                    border-color: var(--primary) !important;
                    box-shadow: 0 0 0 4px rgba(37, 99, 235, 0.1) !important;
                    outline: none;
                }
                @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
            `}</style>
        </div>
    );
}
