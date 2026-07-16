import { useState } from "react";
import Layout from "../components/Layout/Layout";
import { aiAPI } from "../services/api";
import "./Reports.css";

function Reports() {
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(false);
  const [exporting, setExporting] = useState(null);

  const generateReport = async () => {
    setLoading(true);
    try {
      const res = await aiAPI.getDailyReport();
      setReport(res.data);
    } catch (err) {
      console.error("Report generation error:", err);
    } finally {
      setLoading(false);
    }
  };

  const downloadPDF = async () => {
    setExporting("pdf");
    try {
      const res = await aiAPI.downloadPDF();
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `fleetdash-report-${Date.now()}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error("PDF download error:", err);
    } finally {
      setExporting(null);
    }
  };

  const downloadExcel = async () => {
    setExporting("excel");
    try {
      const res = await aiAPI.downloadExcel();
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `fleetdash-report-${Date.now()}.xlsx`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Excel download error:", err);
    } finally {
      setExporting(null);
    }
  };

  return (
    <Layout>
      <div className="reports-page">
        <div className="reports-header">
          <div>
            <h1>📄 AI Report Generator</h1>
            <p>Generate and export AI-powered daily fleet summaries</p>
          </div>
          <button className="generate-btn" onClick={generateReport} disabled={loading}>
            {loading ? "⏳ Generating..." : "🚀 Generate Report"}
          </button>
        </div>

        {!report && !loading && (
          <div className="reports-welcome">
            <div className="welcome-icon">📊</div>
            <h3>Ready to analyze your fleet</h3>
            <p>Click "Generate Report" to create an AI-powered daily fleet summary with insights on vehicles, fuel, maintenance, and driver performance.</p>
          </div>
        )}

        {loading && (
          <div className="reports-loading">
            <div className="skeleton-block" style={{ height: 80 }}></div>
            <div className="skeleton-block" style={{ height: 120 }}></div>
            <div className="skeleton-block" style={{ height: 100 }}></div>
          </div>
        )}

        {report && !loading && (
          <>
            <div className="report-narrative">
              <div className="narrative-icon">🤖</div>
              <div className="narrative-content">
                <div className="narrative-label">AI Generated Summary</div>
                <div className="narrative-text">{report.narrative}</div>
              </div>
            </div>

            <div className="report-grid">
              <div className="report-section">
                <h3>🚛 Fleet Summary</h3>
                <div className="report-stats">
                  <div className="report-stat">
                    <span className="stat-label">Total Vehicles</span>
                    <span className="stat-value">{report.summary.totalVehicles}</span>
                  </div>
                  <div className="report-stat">
                    <span className="stat-label">Active</span>
                    <span className="stat-value">{report.summary.activeVehicles}</span>
                  </div>
                  <div className="report-stat">
                    <span className="stat-label">Total Distance</span>
                    <span className="stat-value">{report.summary.totalDistance.toLocaleString()} km</span>
                  </div>
                  <div className="report-stat">
                    <span className="stat-label">Avg Speed</span>
                    <span className="stat-value">{report.summary.avgSpeed} km/h</span>
                  </div>
                  <div className="report-stat">
                    <span className="stat-label">Avg Fuel</span>
                    <span className="stat-value">{report.summary.avgFuel}%</span>
                  </div>
                </div>
              </div>

              <div className="report-section">
                <h3>💚 Fleet Health</h3>
                <div className="report-stats">
                  <div className="report-stat">
                    <span className="stat-label">Overall Score</span>
                    <span className="stat-value" style={{ color: report.fleetHealth.overallScore > 70 ? "#22c55e" : "#ef4444" }}>
                      {report.fleetHealth.overallScore}/100
                    </span>
                  </div>
                  <div className="report-stat">
                    <span className="stat-label">Need Service</span>
                    <span className="stat-value">{report.fleetHealth.vehiclesNeedingService}</span>
                  </div>
                  <div className="report-stat">
                    <span className="stat-label">Critical</span>
                    <span className="stat-value" style={{ color: report.fleetHealth.criticalMaintenance > 0 ? "#ef4444" : "#22c55e" }}>
                      {report.fleetHealth.criticalMaintenance}
                    </span>
                  </div>
                  <div className="report-stat">
                    <span className="stat-label">High Priority</span>
                    <span className="stat-value">{report.fleetHealth.highMaintenance}</span>
                  </div>
                </div>
              </div>

              <div className="report-section">
                <h3>👤 Driver Analysis</h3>
                <div className="report-stats">
                  <div className="report-stat">
                    <span className="stat-label">Total Drivers</span>
                    <span className="stat-value">{report.drivers.total}</span>
                  </div>
                  <div className="report-stat">
                    <span className="stat-label">Excellent</span>
                    <span className="stat-value" style={{ color: "#22c55e" }}>{report.drivers.excellentDrivers}</span>
                  </div>
                  <div className="report-stat">
                    <span className="stat-label">Risky</span>
                    <span className="stat-value" style={{ color: report.drivers.riskyDrivers > 0 ? "#ef4444" : "#22c55e" }}>
                      {report.drivers.riskyDrivers}
                    </span>
                  </div>
                </div>
              </div>

              <div className="report-section">
                <h3>⛽ Fuel Analysis</h3>
                <div className="report-stats">
                  <div className="report-stat">
                    <span className="stat-label">Avg Fuel Level</span>
                    <span className="stat-value">{report.fuelAnalysis.avgFuelLevel}%</span>
                  </div>
                  <div className="report-stat">
                    <span className="stat-label">Efficiency Change</span>
                    <span className="stat-value" style={{ color: report.fuelAnalysis.fuelEfficiencyChange < 0 ? "#ef4444" : "#22c55e" }}>
                      {report.fuelAnalysis.fuelEfficiencyChange}%
                    </span>
                  </div>
                  <div className="report-stat">
                    <span className="stat-label">Est. Fuel Cost</span>
                    <span className="stat-value">₹{report.fuelAnalysis.totalEstimatedFuelCost.toLocaleString()}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="report-actions">
              <button className="export-btn pdf" onClick={downloadPDF} disabled={exporting === "pdf"}>
                {exporting === "pdf" ? "⏳ Generating PDF..." : "📄 Download PDF"}
              </button>
              <button className="export-btn excel" onClick={downloadExcel} disabled={exporting === "excel"}>
                {exporting === "excel" ? "⏳ Generating Excel..." : "📊 Download Excel"}
              </button>
            </div>
          </>
        )}
      </div>
    </Layout>
  );
}

export default Reports;