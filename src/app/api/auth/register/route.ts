import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { db } from "@/lib/db";
import { slugify } from "@/lib/utils";
import { rateLimit } from "@/lib/rate-limit";

export async function POST(req: NextRequest) {
  // Rate limit: 5 registrations per IP per hour
  const ip = req.headers.get("x-forwarded-for") || "unknown";
  const { success } = rateLimit(`register:${ip}`, 5, 3600000);
  if (!success) {
    return NextResponse.json({ error: "Too many registration attempts" }, { status: 429 });
  }

  try {
    const body = await req.json();
    const { name, email, password, orgName, orgCity, orgState } = body;

    if (!name || !email || !password || !orgName) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    if (password.length < 8) {
      return NextResponse.json(
        { error: "Password must be at least 8 characters" },
        { status: 400 }
      );
    }

    const existingUser = await db.user.findUnique({ where: { email } });
    if (existingUser) {
      return NextResponse.json(
        { error: "Email already registered" },
        { status: 400 }
      );
    }

    const passwordHash = await bcrypt.hash(password, 12);
    const orgSlug = slugify(orgName);

    // Check if org slug already taken
    const existingOrg = await db.organization.findUnique({
      where: { slug: orgSlug },
    });
    if (existingOrg) {
      return NextResponse.json(
        { error: "An organization with a similar name already exists" },
        { status: 400 }
      );
    }

    // Create org, admin user, and seed defaults in a transaction
    const result = await db.$transaction(async (tx) => {
      const org = await tx.organization.create({
        data: {
          name: orgName,
          slug: orgSlug,
          city: orgCity,
          state: orgState,
        },
      });

      const user = await tx.user.create({
        data: {
          name,
          email,
          passwordHash,
          role: "INCUBATOR_ADMIN",
          organizationId: org.id,
        },
      });

      // Seed default job categories
      await tx.jobCategory.createMany({
        data: [
          { name: "Full-time Employees", type: "direct", description: "Direct full-time hires", organizationId: org.id },
          { name: "Part-time Employees", type: "direct", description: "Direct part-time hires", organizationId: org.id },
          { name: "Interns", type: "direct", description: "Direct internship positions", organizationId: org.id },
          { name: "Contract Workers", type: "indirect", description: "Indirect contract employment", organizationId: org.id },
          { name: "Freelancers", type: "indirect", description: "Indirect freelance work", organizationId: org.id },
        ],
      });

      // Create a default program
      await tx.program.create({
        data: {
          name: "General Incubation",
          type: "CUSTOM",
          description: "Default incubation program",
          organizationId: org.id,
        },
      });

      // Create trial subscription (14 days)
      await tx.subscription.create({
        data: {
          organizationId: org.id,
          status: "TRIAL",
          trialEndsAt: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
        },
      });

      return { user, org };
    });

    return NextResponse.json(
      {
        message: "Account created successfully",
        userId: result.user.id,
        orgId: result.org.id,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Registration error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
