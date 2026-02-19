import { useState } from "react";
import { useAuth } from "../auth/AuthContext.jsx";
import { downloadWithAuth } from "../api/reportApi.js";

const BASE_URL = "/api/reports";

export default function VendorReportPanel() {
  const [id, setId] = useState("");
  const { token } = useAuth();

  return (
    <div className="report-panel">
      <h3>🏢 Vendor Directory Reports</h3>

      <div className="report-section">
        <span className="report-section-label">Batch Export</span>
        <div className="report-actions">
          <button
            className="btn report-btn pdf-btn"
            onClick={() =>
              downloadWithAuth({
                url: `${BASE_URL}/vendors?format=pdf`,
                filename: "vendors_directory.pdf",
                token
              })
            }
          >
            📄 Download Full List (PDF)
          </button>

          <button
            className="btn report-btn excel-btn"
            onClick={() =>
              downloadWithAuth({
                url: `${BASE_URL}/vendors?format=xlsx`,
                filename: "vendors_directory.xlsx",
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
        <span className="report-section-label">Individual Vendor Lookup</span>
        <div className="report-id-section">
          <input
            className="form-input"
            type="number"
            placeholder="Enter Vendor ID"
            value={id}
            onChange={(e) => setId(e.target.value)}
          />

          <button
            className="btn report-btn pdf-btn"
            disabled={!id}
            onClick={() =>
              downloadWithAuth({
                url: `${BASE_URL}/vendors/${id}?format=pdf`,
                filename: `vendor_details_${id}.pdf`,
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
                url: `${BASE_URL}/vendors/${id}?format=xlsx`,
                filename: `vendor_details_${id}.xlsx`,
                token
              })
            }
          >
            Excel
          </button>
        </div>
        {!id && <p style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 8 }}>Please enter a valid vendor ID to enable single lookup export.</p>}
      </div>
    </div>
  );
}
