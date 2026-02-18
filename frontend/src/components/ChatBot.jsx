import { useState, useEffect, useRef } from 'react'

const KNOWLEDGE_BASE = [
    {
        keywords: ['svpms', 'system', 'project', 'what is this', 'about'],
        answer: 'SVPMS (Supplier & Vendor Procurement Management System) is a platform for managing vendor onboarding, purchase requisitions (PR), and purchase orders (PO) with role-based access control.'
    },
    {
        keywords: ['upload', 'document', 'file', 'attach', 'proof', 'aadhaar', 'pan', 'gst'],
        answer: 'To upload documents (like GST/PAN or Approval letters), go to "Select Role", pick your role, fill in your details, and use the "Upload File" section at the bottom before clicking Apply.'
    },
    {
        keywords: ['select', 'role', 'apply', 'choose', 'onboard'],
        answer: 'After logging in, go to "Select Role" from the sidebar. Choose either "Vendor" or "Enterprise User", enter your professional details, upload required documents, and submit for Admin approval.'
    },
    {
        keywords: ['login', 'signin', 'sign in', 'sign up', 'signup', 'register', 'create account'],
        answer: 'You can create an account via the "Join Us" tab on the Login page. Once registered, use the "Sign In" tab. After logging in, you must apply for a role to access the full system.'
    },
    {
        keywords: ['dashboard', 'admin', 'procurement', 'finance', 'access'],
        answer: 'Dashboards are role-based. Admins see User Management; Procurement and Finance see PR and PO modules. Vendors see their own Profiles and Orders. Access is granted once your role request is approved.'
    },
    {
        keywords: ['work', 'tasks', 'responsibility', 'admin role', 'procurement role', 'finance role'],
        answer: 'ADMIN: Manages users and approves role requests. PROCUREMENT: Creates/reviews PRs and POs. FINANCE: Reviews financial data and PR/POs. VENDOR: Manages items and delivers orders.'
    },
    {
        keywords: ['deliver', 'delivery', 'ship', 'vendor delivery', 'received'],
        answer: 'Vendors can track their "My Orders" section. When goods are sent, the "Delivered Quantity" is updated in the PO system to track fulfillment and close the order.'
    },
    {
        keywords: ['vendor', 'onboarding', 'supplier'],
        answer: 'Admins and Procurement officers can manage vendors. Users can register and then request the VENDOR role to be onboarded. Vendors can manage their profiles and track orders.'
    },
    {
        keywords: ['pr', 'requisition', 'request'],
        answer: 'Purchase Requisitions (PR) are created to request items. They go through a review process. Admin, Procurement, and Finance roles can view and manage PRs.'
    },
    {
        keywords: ['po', 'order', 'purchase order'],
        answer: 'Purchase Orders (PO) are created from approved PRs. They include GST calculations and allow tracking of delivered quantities until the order is closed.'
    }
]

export default function ChatBot() {
    const [isOpen, setIsOpen] = useState(false)
    const [messages, setMessages] = useState([
        { role: 'bot', text: 'Hello! I am your SVPMS Assistant. How can I help you with the project today?' }
    ])
    const [input, setInput] = useState('')
    const scrollRef = useRef(null)

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight
        }
    }, [messages])

    const handleSend = (e) => {
        e.preventDefault()
        if (!input.trim()) return

        const userMsg = input.trim()
        setMessages(prev => [...prev, { role: 'user', text: userMsg }])
        setInput('')

        // Process bot response
        setTimeout(() => {
            const lowerInput = userMsg.toLowerCase()
            let foundAnswer = null

            for (const item of KNOWLEDGE_BASE) {
                if (item.keywords.some(k => lowerInput.includes(k))) {
                    foundAnswer = item.answer
                    break
                }
            }

            const response = foundAnswer || "I don't know about this, please ask me about this project."
            setMessages(prev => [...prev, { role: 'bot', text: response }])
        }, 600)
    }

    return (
        <div className="chatbot-container">
            {isOpen && (
                <div className="chatbot-window">
                    <div className="chatbot-header">
                        <div className="chatbot-header-info">
                            <div className="chatbot-logo">🤖</div>
                            <div className="chatbot-title">
                                <h3>SVPMS Guide</h3>
                                <span>Always online</span>
                            </div>
                        </div>
                        <button className="chatbot-close" onClick={() => setIsOpen(false)}>&times;</button>
                    </div>

                    <div className="chatbot-messages" ref={scrollRef}>
                        {messages.map((m, i) => (
                            <div key={i} className={`chat-msg ${m.role}`}>
                                {m.text}
                            </div>
                        ))}
                    </div>

                    <form className="chatbot-input-area" onSubmit={handleSend}>
                        <input
                            className="chatbot-input"
                            placeholder="Ask me anything..."
                            value={input}
                            onChange={e => setInput(e.target.value)}
                        />
                        <button className="chatbot-send" type="submit">
                            <span style={{ transform: 'rotate(-45deg)', display: 'inline-block', marginBottom: '2px' }}>✈️</span>
                        </button>
                    </form>
                </div>
            )}

            <button className="chatbot-trigger" onClick={() => setIsOpen(!isOpen)}>
                {isOpen ? '💬' : '🤖'}
            </button>
        </div>
    )
}
