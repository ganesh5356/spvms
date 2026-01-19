import { useState } from "react";
import VendorReportPanel from "../components/VendorReportPanel";
import PRReportPanel from "../components/PRReportPanel";
import POReportPanel from "../components/POReportPanel";

export default function DownloadReports() {
  const [selected, setSelected] = useState(null);

  if (selected === "vendors") return <VendorReportPanel />;
  if (selected === "pr") return <PRReportPanel />;
  if (selected === "po") return <POReportPanel />;

  return (
    <section className="view download-reports">

      {/* ===== HEADER ===== */}
      <div className="page-header">
        <h2>Download Reports</h2>
        <p className="page-subtitle">
          Select a report type to download PDF or Excel files
        </p>
      </div>

      {/* ===== REPORT OPTIONS ===== */}
      <div className="report-options">

        <div
          className="report-card"
          onClick={() => setSelected("vendors")}
        >
          <div className="report-icon">🏢</div>
          <div className="report-title">Vendor Reports</div>
          <div className="report-desc">All vendors or by vendor ID</div>
        </div>

        <div
          className="report-card"
          onClick={() => setSelected("pr")}
        >
          <div className="report-icon">📋</div>
          <div className="report-title">PR Reports</div>
          <div className="report-desc">Purchase requisitions</div>
        </div>

        <div
          className="report-card"
          onClick={() => setSelected("po")}
        >
          <div className="report-icon">📦</div>
          <div className="report-title">PO Reports</div>
          <div className="report-desc">Purchase orders & invoices</div>
        </div>

      </div>

    </section>
  );
}
