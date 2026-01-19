import { useState } from "react";
import { useAuth } from "../auth/AuthContext.jsx";
import { downloadWithAuth } from "../api/reportApi.js";

const BASE_URL = "http://localhost:8080/api/reports";

export default function PRReportPanel() {
  const [id, setId] = useState("");
  const { token } = useAuth();

  return (
    <div>
      <h3>Purchase Requisition Reports</h3>

      <button
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

      <hr />

      <input
        type="number"
        placeholder="PR ID"
        value={id}
        onChange={(e) => setId(e.target.value)}
      />

      <button
        disabled={!id}
        onClick={() =>
          downloadWithAuth({
            url: `${BASE_URL}/pr/${id}?format=pdf`,
            filename: `pr_${id}.pdf`,
            token
          })
        }
      >
        Download by ID (PDF)
      </button>

      <button
        disabled={!id}
        onClick={() =>
          downloadWithAuth({
            url: `${BASE_URL}/pr/${id}?format=xlsx`,
            filename: `pr_${id}.xlsx`,
            token
          })
        }
      >
        Download by ID (Excel)
      </button>
    </div>
  );
}
