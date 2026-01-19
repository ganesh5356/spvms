import { useState } from "react";
import { useAuth } from "../auth/AuthContext.jsx";
import { downloadWithAuth } from "../api/reportApi.js";

const BASE_URL = "http://localhost:8080/api/reports";

export default function PRReportPanel() {
  const [id, setId] = useState("");
  const { token } = useAuth();

  return (
    <section className="report-panel">
      <h3>Purchase Requisition Reports</h3>

      <div className="report-actions">
        <button
          className="btn outline report-btn pdf-btn"
          onClick={() =>
            downloadWithAuth({
              url: `${BASE_URL}/pr?format=pdf`,
              filename: "prs.pdf",
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
              url: `${BASE_URL}/pr?format=xlsx`,
              filename: "prs.xlsx",
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
          placeholder="PR ID"
          value={id}
          onChange={(e) => setId(e.target.value)}
        />

        <button
          className="btn outline report-btn pdf-btn"
          disabled={!id}
          onClick={() =>
            downloadWithAuth({
              url: `${BASE_URL}/pr/${id}?format=pdf`,
              filename: `pr_${id}.pdf`,
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
              url: `${BASE_URL}/pr/${id}?format=xlsx`,
              filename: `pr_${id}.xlsx`,
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
