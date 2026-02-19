import { useState } from "react";
import { useAuth } from "../auth/AuthContext.jsx";
import { downloadWithAuth } from "../api/reportApi.js";

const BASE_URL = "/api/reports";

export default function POReportPanel() {
  const [id, setId] = useState("");
  const { token } = useAuth();

  return (
    <div className="report-panel">
      <h3>📦 Purchase Order Reports</h3>

      <div className="report-section">
        <span className="report-section-label">Order Volume Export</span>
        <div className="report-actions">
          <button
            className="btn report-btn pdf-btn"
            onClick={() =>
              downloadWithAuth({
                url: `${BASE_URL}/po?format=pdf`,
                filename: "purchase_orders_master.pdf",
                token
              })
            }
          >
            📄 Download Master List (PDF)
          </button>

          <button
            className="btn report-btn excel-btn"
            onClick={() =>
              downloadWithAuth({
                url: `${BASE_URL}/po?format=xlsx`,
                filename: "purchase_orders_master.xlsx",
                token
              })
            }
          >
            📊 Export to Excel (XLSX)
          </button>
        </div>
      </div>

      <div className="report-divider" />

      <div className="report-section">
        <span className="report-section-label">Single Order Export</span>
        <div className="report-id-section">
          <input
            className="form-input"
            type="number"
            placeholder="Enter PO ID"
            value={id}
            onChange={(e) => setId(e.target.value)}
          />

          <button
            className="btn report-btn pdf-btn"
            disabled={!id}
            onClick={() =>
              downloadWithAuth({
                url: `${BASE_URL}/po/${id}?format=pdf`,
                filename: `order_summary_${id}.pdf`,
                token
              })
            }
          >
            PDF
          </button>

          <button
            className="btn report-btn excel-btn"
            disabled={!id}
            onClick={() =>
              downloadWithAuth({
                url: `${BASE_URL}/po/${id}?format=xlsx`,
                filename: `order_summary_${id}.xlsx`,
                token
              })
            }
          >
            Excel
          </button>
        </div>
        {!id && <p style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 8 }}>Enter a Purchase Order ID to generate a focused delivery and payment report.</p>}
      </div>
    </div>
  );
}
