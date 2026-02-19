import { useState } from "react";
import { useAuth } from "../auth/AuthContext.jsx";
import { downloadWithAuth } from "../api/reportApi.js";

const BASE_URL = "/api/reports";

export default function PRReportPanel() {
  const [id, setId] = useState("");
  const { token } = useAuth();

  return (
    <div className="report-panel">
      <h3>📋 Requisition Reports</h3>

      <div className="report-section">
        <span className="report-section-label">General Export</span>
        <div className="report-actions">
          <button
            className="btn report-btn pdf-btn"
            onClick={() =>
              downloadWithAuth({
                url: `${BASE_URL}/pr?format=pdf`,
                filename: "requisitions_summary.pdf",
                token
              })
            }
          >
            📄 Download Summary (PDF)
          </button>

          <button
            className="btn report-btn excel-btn"
            onClick={() =>
              downloadWithAuth({
                url: `${BASE_URL}/pr?format=xlsx`,
                filename: "requisitions_summary.xlsx",
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
        <span className="report-section-label">Targeted Requisition Export</span>
        <div className="report-id-section">
          <input
            className="form-input"
            type="number"
            placeholder="Enter PR ID"
            value={id}
            onChange={(e) => setId(e.target.value)}
          />

          <button
            className="btn report-btn pdf-btn"
            disabled={!id}
            onClick={() =>
              downloadWithAuth({
                url: `${BASE_URL}/pr/${id}?format=pdf`,
                filename: `pr_report_${id}.pdf`,
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
                url: `${BASE_URL}/pr/${id}?format=xlsx`,
                filename: `pr_report_${id}.xlsx`,
                token
              })
            }
          >
            Excel
          </button>
        </div>
        {!id && <p style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 8 }}>Enter a Requisition ID to generate a detailed status report for that item.</p>}
      </div>
    </div>
  );
}
