import { db } from "./db";

interface PassportFlag {
  signal: "email" | "pan" | "cin" | "dpiit" | "company_name" | "website" | "founder_name_city";
  strength: "definite" | "likely";
  matchedStartup: string; // startup name
  matchedOrg: string; // incubator name
  matchedId: string; // startup id
  details: string;
}

/**
 * Scan for cross-incubator matches when a startup is added.
 * Returns an array of flags if matches found.
 */
export async function runPassportScan({
  startupId,
  name,
  founderEmail,
  founderName,
  city,
  panNumber,
  cinNumber,
  dpiitNumber,
  website,
  excludeOrgId,
}: {
  startupId: string;
  name: string;
  founderEmail?: string | null;
  founderName?: string | null;
  city?: string | null;
  panNumber?: string | null;
  cinNumber?: string | null;
  dpiitNumber?: string | null;
  website?: string | null;
  excludeOrgId: string;
}): Promise<PassportFlag[]> {
  const flags: PassportFlag[] = [];

  // 1. Email match (strongest) — check if founder email exists in another org
  if (founderEmail) {
    const emailMatches = await db.user.findMany({
      where: {
        email: founderEmail,
        role: "STARTUP_FOUNDER",
        startups: {
          some: {
            cohort: { organizationId: { not: excludeOrgId } },
          },
        },
      },
      include: {
        startups: {
          where: { cohort: { organizationId: { not: excludeOrgId } } },
          include: {
            cohort: { include: { organization: { select: { name: true } } } },
          },
        },
      },
    });

    for (const user of emailMatches) {
      for (const s of user.startups) {
        flags.push({
          signal: "email",
          strength: "definite",
          matchedStartup: s.name,
          matchedOrg: s.cohort.organization.name,
          matchedId: s.id,
          details: `Founder email ${founderEmail} found at ${s.cohort.organization.name}`,
        });
      }
    }
  }

  // 2. PAN/CIN/DPIIT matches
  const regConditions = [];
  if (panNumber) regConditions.push({ panNumber });
  if (cinNumber) regConditions.push({ cinNumber });
  if (dpiitNumber) regConditions.push({ dpiitNumber });

  if (regConditions.length > 0) {
    const regMatches = await db.startup.findMany({
      where: {
        OR: regConditions,
        id: { not: startupId },
        cohort: { organizationId: { not: excludeOrgId } },
      },
      include: {
        cohort: { include: { organization: { select: { name: true } } } },
      },
    });

    for (const match of regMatches) {
      const signals = [];
      if (panNumber && match.panNumber === panNumber) signals.push("PAN");
      if (cinNumber && match.cinNumber === cinNumber) signals.push("CIN");
      if (dpiitNumber && match.dpiitNumber === dpiitNumber) signals.push("DPIIT");

      flags.push({
        signal: signals[0]?.toLowerCase() as PassportFlag["signal"],
        strength: "definite",
        matchedStartup: match.name,
        matchedOrg: match.cohort.organization.name,
        matchedId: match.id,
        details: `Matched on ${signals.join(", ")} at ${match.cohort.organization.name}`,
      });
    }
  }

  // 3. Company name match (case-insensitive)
  if (name) {
    const nameMatches = await db.startup.findMany({
      where: {
        name: { equals: name, mode: "insensitive" },
        id: { not: startupId },
        cohort: { organizationId: { not: excludeOrgId } },
      },
      include: {
        cohort: { include: { organization: { select: { name: true } } } },
      },
    });

    for (const match of nameMatches) {
      // Skip if already flagged
      if (flags.some((f) => f.matchedId === match.id)) continue;
      flags.push({
        signal: "company_name",
        strength: "likely",
        matchedStartup: match.name,
        matchedOrg: match.cohort.organization.name,
        matchedId: match.id,
        details: `Company name "${name}" found at ${match.cohort.organization.name}`,
      });
    }
  }

  // 4. Website domain match
  if (website) {
    const domain = website.replace(/^https?:\/\//, "").replace(/^www\./, "").split("/")[0];
    if (domain) {
      const webMatches = await db.startup.findMany({
        where: {
          website: { contains: domain, mode: "insensitive" },
          id: { not: startupId },
          cohort: { organizationId: { not: excludeOrgId } },
        },
        include: {
          cohort: { include: { organization: { select: { name: true } } } },
        },
      });

      for (const match of webMatches) {
        if (flags.some((f) => f.matchedId === match.id)) continue;
        flags.push({
          signal: "website",
          strength: "likely",
          matchedStartup: match.name,
          matchedOrg: match.cohort.organization.name,
          matchedId: match.id,
          details: `Website domain "${domain}" found at ${match.cohort.organization.name}`,
        });
      }
    }
  }

  // Save flags to startup
  if (flags.length > 0) {
    await db.startup.update({
      where: { id: startupId },
      data: { passportFlags: JSON.parse(JSON.stringify(flags)) },
    });
  }

  return flags;
}
