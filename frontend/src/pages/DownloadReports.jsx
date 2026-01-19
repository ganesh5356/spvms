import { useState } from "react";
import VendorReportPanel from "../components/VendorReportPanel";
import PRReportPanel from "../components/PRReportPanel";
import POReportPanel from "../components/POReportPanel";

export default function DownloadReports() {
  const [selected, setSelected] = useState(null);

  return (
    <div style={{ padding: 30 }}>
      <h2>Download Reports</h2>

      {/* Main Selection */}
      <div style={{ marginBottom: 20 }}>
        <button onClick={() => setSelected("vendor")}>Vendors</button>{" "}
        <button onClick={() => setSelected("pr")}>PR</button>{" "}
        <button onClick={() => setSelected("po")}>PO</button>
      </div>

      {/* Conditional Panels */}
      {selected === "vendor" && <VendorReportPanel />}
      {selected === "pr" && <PRReportPanel />}
      {selected === "po" && <POReportPanel />}
    </div>
  );
}
