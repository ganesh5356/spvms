import { useState } from "react";
import { useAuth } from "../auth/AuthContext.jsx";
import { downloadWithAuth } from "../api/reportApi.js";

const BASE_URL = "http://localhost:8080/api/reports";

export default function POReportPanel() {
  const [id, setId] = useState("");
  const { token } = useAuth();

  return (
    <div>
      <h3>Purchase Order Reports</h3>

      <button
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

      <hr />

      <input
        type="number"
        placeholder="PO ID"
        value={id}
        onChange={(e) => setId(e.target.value)}
      />

      <button
        disabled={!id}
        onClick={() =>
          downloadWithAuth({
            url: `${BASE_URL}/po/${id}?format=pdf`,
            filename: `po_${id}.pdf`,
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
            url: `${BASE_URL}/po/${id}?format=xlsx`,
            filename: `po_${id}.xlsx`,
            token
          })
        }
      >
        Download by ID (Excel)
      </button>
    </div>
  );
}
