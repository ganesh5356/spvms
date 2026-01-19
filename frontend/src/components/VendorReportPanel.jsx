import { useState } from "react";
import { useAuth } from "../auth/AuthContext.jsx";
import { downloadWithAuth } from "../api/reportApi.js";

const BASE_URL = "http://localhost:8080/api/reports";

export default function VendorReportPanel() {
  const [id, setId] = useState("");
  const { token } = useAuth();

  return (
    <div>
      <h3>Vendor Reports</h3>

      {/* ===== DOWNLOAD ALL ===== */}
      <button
        onClick={() =>
          downloadWithAuth({
            url: `${BASE_URL}/vendors?format=pdf`,
            filename: "vendors.pdf",
            token
          })
        }
      >
        Download All (PDF)
      </button>

      <button
        onClick={() =>
          downloadWithAuth({
            url: `${BASE_URL}/vendors?format=xlsx`,
            filename: "vendors.xlsx",
            token
          })
        }
      >
        Download All (Excel)
      </button>

      <hr />

      {/* ===== DOWNLOAD BY ID ===== */}
      <input
        type="number"
        placeholder="Vendor ID"
        value={id}
        onChange={(e) => setId(e.target.value)}
      />

      <button
        disabled={!id}
        onClick={() =>
          downloadWithAuth({
            url: `${BASE_URL}/vendors/${id}?format=pdf`,
            filename: `vendor_${id}.pdf`,
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
            url: `${BASE_URL}/vendors/${id}?format=xlsx`,
            filename: `vendor_${id}.xlsx`,
            token
          })
        }
      >
        Download by ID (Excel)
      </button>
    </div>
  );
}
