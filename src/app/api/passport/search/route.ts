import { isIncubatorRole } from "@/lib/roles";
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

// GET — search startups across the entire platform by passport ID, DPIIT, CIN, PAN, or email
export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user || !isIncubatorRole(session.user.role)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const query = searchParams.get("q")?.trim();

  if (!query || query.length < 2) {
    return NextResponse.json({ error: "Search query too short" }, { status: 400 });
  }

  // Search across multiple fields
  const startups = await db.startup.findMany({
    where: {
      OR: [
        { passportId: { contains: query, mode: "insensitive" } },
        { name: { contains: query, mode: "insensitive" } },
        { dpiitNumber: { contains: query, mode: "insensitive" } },
        { cinNumber: { contains: query, mode: "insensitive" } },
        { panNumber: { contains: query, mode: "insensitive" } },
        { founders: { some: { email: { contains: query, mode: "insensitive" } } } },
        { founders: { some: { name: { contains: query, mode: "insensitive" } } } },
        { founders: { some: { passportId: { contains: query, mode: "insensitive" } } } },
      ],
    },
    include: {
      cohort: {
        include: {
          organization: { select: { id: true, name: true, city: true, state: true } },
          program: { select: { name: true, type: true } },
        },
      },
      founders: { select: { name: true, email: true, passportId: true } },
    },
    take: 20,
  });

  const results = startups.map((s) => ({
    id: s.id,
    name: s.name,
    passportId: s.passportId,
    slug: s.slug,
    sector: s.sector,
    stage: s.stage,
    city: s.city,
    state: s.state,
    dpiitNumber: s.dpiitNumber,
    cinNumber: s.cinNumber,
    alumniStatus: s.alumniStatus,
    incubator: s.cohort.organization.name,
    incubatorCity: s.cohort.organization.city,
    incubatorState: s.cohort.organization.state,
    isOwnOrg: s.cohort.organization.id === session.user.organizationId,
    cohort: s.cohort.name,
    program: s.cohort.program?.name || null,
    programType: s.cohort.program?.type || null,
    founders: s.founders,
    createdAt: s.createdAt,
  }));

  return NextResponse.json(results);
}
