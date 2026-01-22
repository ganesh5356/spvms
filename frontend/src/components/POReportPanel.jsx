import { useState } from "react";
import { useAuth } from "../auth/AuthContext.jsx";
import { downloadWithAuth } from "../api/reportApi.js";

const BASE_URL = "http://localhost:8082/api/reports";

export default function POReportPanel() {
  const [id, setId] = useState("");
  const { token } = useAuth();

  return (
    <section className="report-panel">
      <h3>Purchase Order Reports</h3>

      <div className="report-actions">
        <button
          className="btn outline report-btn pdf-btn"
          onClick={() =>
            downloadWithAuth({
              url: `${BASE_URL}/po?format=pdf`,
              filename: "pos.pdf",
              token
            })
          }
        >
          Download All (PDF)
        </button>

        <button
          className="btn outline report-btn excel-btn"
          onClick={() =>
            downloadWithAuth({
              url: `${BASE_URL}/po?format=xlsx`,
              filename: "pos.xlsx",
              token
            })
          }
        >
          Download All (Excel)
        </button>
      </div>

      <div className="report-divider" />

      <div className="report-id-section">
        <input
          type="number"
          placeholder="PO ID"
          value={id}
          onChange={(e) => setId(e.target.value)}
        />

        <button
          className="btn outline report-btn pdf-btn"
          disabled={!id}
          onClick={() =>
            downloadWithAuth({
              url: `${BASE_URL}/po/${id}?format=pdf`,
              filename: `po_${id}.pdf`,
              token
            })
          }
        >
          PDF
        </button>

        <button
          className="btn outline report-btn excel-btn"
          disabled={!id}
          onClick={() =>
            downloadWithAuth({
              url: `${BASE_URL}/po/${id}?format=xlsx`,
              filename: `po_${id}.xlsx`,
              token
            })
          }
        >
          Excel
        </button>
      </div>
    </section>
  );
}
