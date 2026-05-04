import { isIncubatorRole } from "@/lib/roles";
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";

const DATA_LABELS: Record<string, string> = {
  totalStartups: "Total Startups",
  activeStartups: "Active Startups",
  graduatedStartups: "Graduated Startups",
  totalRevenue: "Total Revenue (INR)",
  totalEmployees: "Total Employees",
  totalFunding: "Total Funding Raised (INR)",
  totalIPsFiled: "IPs Filed",
  totalIPsGranted: "IPs Granted",
  totalJobsCreated: "Jobs Created",
  totalEvents: "Events Conducted",
  womenLedStartups: "Women-Led Startups",
  scStStartups: "SC/ST Startups",
  ruralStartups: "Rural Startups",
  reportingRate: "Reporting Rate (%)",
};

function formatINR(amount: number): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount);
}

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user || !isIncubatorRole(session.user.role)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const reportId = searchParams.get("id");

  if (!reportId) {
    return NextResponse.json({ error: "Report ID required" }, { status: 400 });
  }

  const report = await db.grantorReport.findFirst({
    where: { id: reportId, organizationId: session.user.organizationId! },
    include: {
      organization: { select: { name: true, city: true, state: true, type: true } },
    },
  });

  if (!report) {
    return NextResponse.json({ error: "Report not found" }, { status: 404 });
  }

  const data = report.data as Record<string, unknown>;
  const org = report.organization;

  // Build PDF
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();

  // Header
  doc.setFontSize(18);
  doc.setFont("helvetica", "bold");
  doc.text(org.name, pageWidth / 2, 20, { align: "center" });

  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  const location = [org.city, org.state].filter(Boolean).join(", ");
  if (location) {
    doc.text(location, pageWidth / 2, 27, { align: "center" });
  }
  if (org.type) {
    doc.text(`Type: ${org.type}`, pageWidth / 2, 33, { align: "center" });
  }

  // Report title
  doc.setFontSize(14);
  doc.setFont("helvetica", "bold");
  doc.text(report.name, pageWidth / 2, 43, { align: "center" });

  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.text(
    `Grantor: ${report.grantor}  |  Period: ${report.period}  |  Generated: ${new Date(report.generatedAt).toLocaleDateString("en-IN")}`,
    pageWidth / 2,
    50,
    { align: "center" }
  );

  // Divider
  doc.setLineWidth(0.5);
  doc.line(14, 54, pageWidth - 14, 54);

  // Key metrics table
  const metricsRows: string[][] = [];
  for (const [key, label] of Object.entries(DATA_LABELS)) {
    const val = data[key];
    let display: string;
    if (key === "totalRevenue" || key === "totalFunding") {
      display = formatINR(val as number);
    } else if (typeof val === "number") {
      display = val.toLocaleString("en-IN");
    } else {
      display = String(val ?? "—");
    }
    metricsRows.push([label, display]);
  }

  autoTable(doc, {
    startY: 58,
    head: [["Metric", "Value"]],
    body: metricsRows,
    theme: "grid",
    headStyles: { fillColor: [59, 130, 246], textColor: 255, fontStyle: "bold" },
    styles: { fontSize: 10, cellPadding: 4 },
    columnStyles: { 0: { cellWidth: 100 } },
  });

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let currentY = (doc as any).lastAutoTable.finalY + 10;

  // Sector distribution
  const sectors = data.sectors as Record<string, number> | undefined;
  if (sectors && Object.keys(sectors).length > 0) {
    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.text("Sector Distribution", 14, currentY);
    currentY += 2;

    autoTable(doc, {
      startY: currentY,
      head: [["Sector", "Count"]],
      body: Object.entries(sectors).map(([s, c]) => [
        s.replace(/_/g, " "),
        c.toString(),
      ]),
      theme: "grid",
      headStyles: { fillColor: [34, 197, 94], textColor: 255, fontStyle: "bold" },
      styles: { fontSize: 9, cellPadding: 3 },
    });
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    currentY = (doc as any).lastAutoTable.finalY + 10;
  }

  // Stage distribution
  const stages = data.stages as Record<string, number> | undefined;
  if (stages && Object.keys(stages).length > 0) {
    if (currentY > 250) {
      doc.addPage();
      currentY = 20;
    }

    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.text("Stage Distribution", 14, currentY);
    currentY += 2;

    autoTable(doc, {
      startY: currentY,
      head: [["Stage", "Count"]],
      body: Object.entries(stages).map(([s, c]) => [
        s.replace(/_/g, " "),
        c.toString(),
      ]),
      theme: "grid",
      headStyles: { fillColor: [168, 85, 247], textColor: 255, fontStyle: "bold" },
      styles: { fontSize: 9, cellPadding: 3 },
    });
  }

  // Footer
  const pageCount = doc.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setFont("helvetica", "normal");
    doc.text(
      `Generated by Incubest  |  Page ${i} of ${pageCount}`,
      pageWidth / 2,
      doc.internal.pageSize.getHeight() - 10,
      { align: "center" }
    );
  }

  const pdfBuffer = doc.output("arraybuffer");
  const fileName = `${report.name.replace(/[^a-zA-Z0-9]/g, "_")}.pdf`;

  return new NextResponse(pdfBuffer, {
    status: 200,
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="${fileName}"`,
    },
  });
}
