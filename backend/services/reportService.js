const PDFDocument = require("pdfkit");
const ExcelJS = require("exceljs");
const { generateDailyReport } = require("./aiService");

async function generatePDFReport() {
  const report = await generateDailyReport();
  if (!report) return null;

  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({ margin: 50 });
      const chunks = [];

      doc.on("data", (chunk) => chunks.push(chunk));
      doc.on("end", () => resolve(Buffer.concat(chunks)));
      doc.on("error", reject);

      // Header
      doc.fontSize(24).font("Helvetica-Bold").text("FleetDash Daily Report", { align: "center" });
      doc.fontSize(10).font("Helvetica").text(`Generated: ${new Date(report.generatedAt).toLocaleString()}`, { align: "center" });
      doc.moveDown();

      // Summary
      doc.fontSize(16).font("Helvetica-Bold").text("Fleet Summary");
      doc.moveDown(0.5);
      doc.fontSize(12).font("Helvetica");
      doc.text(`Total Vehicles: ${report.summary.totalVehicles}`);
      doc.text(`Active Vehicles: ${report.summary.activeVehicles}`);
      doc.text(`Total Distance: ${report.summary.totalDistance} km`);
      doc.text(`Average Speed: ${report.summary.avgSpeed} km/h`);
      doc.text(`Average Fuel: ${report.summary.avgFuel}%`);
      doc.moveDown();

      // Fleet Health
      doc.fontSize(16).font("Helvetica-Bold").text("Fleet Health");
      doc.moveDown(0.5);
      doc.fontSize(12).font("Helvetica");
      doc.text(`Overall Score: ${report.fleetHealth.overallScore}/100`);
      doc.text(`Vehicles Needing Service: ${report.fleetHealth.vehiclesNeedingService}`);
      doc.text(`Critical Maintenance: ${report.fleetHealth.criticalMaintenance}`);
      doc.text(`High Priority: ${report.fleetHealth.highMaintenance}`);
      doc.moveDown();

      // Drivers
      doc.fontSize(16).font("Helvetica-Bold").text("Driver Analysis");
      doc.moveDown(0.5);
      doc.fontSize(12).font("Helvetica");
      doc.text(`Total Drivers: ${report.drivers.total}`);
      doc.text(`Excellent Drivers: ${report.drivers.excellentDrivers}`);
      doc.text(`Risky Drivers: ${report.drivers.riskyDrivers}`);
      doc.moveDown();

      // Fuel Analysis
      doc.fontSize(16).font("Helvetica-Bold").text("Fuel Analysis");
      doc.moveDown(0.5);
      doc.fontSize(12).font("Helvetica");
      doc.text(`Average Fuel Level: ${report.fuelAnalysis.avgFuelLevel}%`);
      doc.text(`Fuel Efficiency Change: ${report.fuelAnalysis.fuelEfficiencyChange}%`);
      doc.text(`Estimated Fuel Cost: ₹${report.fuelAnalysis.totalEstimatedFuelCost}`);
      doc.moveDown();

      // Narrative
      doc.fontSize(16).font("Helvetica-Bold").text("AI Summary");
      doc.moveDown(0.5);
      doc.fontSize(12).font("Helvetica");
      doc.text(report.narrative, { align: "left" });

      doc.end();
    } catch (error) {
      reject(error);
    }
  });
}

async function generateExcelReport() {
  const report = await generateDailyReport();
  if (!report) return null;

  const workbook = new ExcelJS.Workbook();
  workbook.creator = "FleetDash AI";
  workbook.created = new Date();

  // Summary Sheet
  const summarySheet = workbook.addWorksheet("Fleet Summary");
  summarySheet.columns = [
    { header: "Metric", key: "metric", width: 25 },
    { header: "Value", key: "value", width: 20 }
  ];
  summarySheet.addRows([
    { metric: "Total Vehicles", value: report.summary.totalVehicles },
    { metric: "Active Vehicles", value: report.summary.activeVehicles },
    { metric: "Total Distance (km)", value: report.summary.totalDistance },
    { metric: "Average Speed (km/h)", value: report.summary.avgSpeed },
    { metric: "Average Fuel (%)", value: report.summary.avgFuel },
    { metric: "Overall Health Score", value: report.fleetHealth.overallScore },
    { metric: "Critical Maintenance", value: report.fleetHealth.criticalMaintenance },
    { metric: "Risky Drivers", value: report.drivers.riskyDrivers },
    { metric: "Fuel Efficiency Change (%)", value: report.fuelAnalysis.fuelEfficiencyChange },
    { metric: "Estimated Fuel Cost (₹)", value: report.fuelAnalysis.totalEstimatedFuelCost }
  ]);

  // Style header
  summarySheet.getRow(1).font = { bold: true, size: 12 };
  summarySheet.getRow(1).fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FF1a73e8" } };
  summarySheet.getRow(1).font = { bold: true, color: { argb: "FFFFFFFF" } };

  // Narrative Sheet
  const narrativeSheet = workbook.addWorksheet("AI Narrative");
  narrativeSheet.columns = [
    { header: "AI Generated Report", key: "narrative", width: 100 }
  ];
  narrativeSheet.addRow({ narrative: report.narrative });
  narrativeSheet.getRow(1).font = { bold: true, size: 12 };

  return workbook;
}

module.exports = { generatePDFReport, generateExcelReport };