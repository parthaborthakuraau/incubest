import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { getMonthName } from "@/lib/utils";

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user || session.user.role !== "INCUBATOR_ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const programId = searchParams.get("programId");

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const where: any = {
    startup: { cohort: { organizationId: session.user.organizationId! } },
  };
  if (programId) where.startup.cohort.programId = programId;

  const reports = await db.report.findMany({
    where,
    include: {
      startup: {
        select: {
          name: true,
          sector: true,
          stage: true,
          cohort: { select: { name: true } },
        },
      },
    },
    orderBy: [{ year: "desc" }, { month: "desc" }],
  });

  // Build CSV
  const dataKeys = new Set<string>();
  for (const r of reports) {
    const data = r.data as Record<string, unknown>;
    Object.keys(data).forEach((k) => dataKeys.add(k));
  }

  const headers = [
    "Startup",
    "Cohort",
    "Sector",
    "Stage",
    "Month",
    "Year",
    "Status",
    "Submitted At",
    "Review Notes",
    ...Array.from(dataKeys).map((k) =>
      k.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())
    ),
  ];

  const rows = reports.map((r) => {
    const data = r.data as Record<string, unknown>;
    return [
      r.startup.name,
      r.startup.cohort.name,
      r.startup.sector.replace(/_/g, " "),
      r.startup.stage.replace(/_/g, " "),
      getMonthName(r.month),
      r.year,
      r.status,
      r.submittedAt ? new Date(r.submittedAt).toLocaleDateString("en-IN") : "",
      r.reviewNotes || "",
      ...Array.from(dataKeys).map((k) => {
        const val = data[k];
        return val !== undefined && val !== null ? String(val) : "";
      }),
    ];
  });

  const escapeCsv = (val: unknown) => {
    const s = String(val ?? "");
    if (s.includes(",") || s.includes('"') || s.includes("\n")) {
      return `"${s.replace(/"/g, '""')}"`;
    }
    return s;
  };

  const csv = [
    headers.map(escapeCsv).join(","),
    ...rows.map((row) => row.map(escapeCsv).join(",")),
  ].join("\n");

  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv",
      "Content-Disposition": `attachment; filename="incubest-reports-export.csv"`,
    },
  });
}
