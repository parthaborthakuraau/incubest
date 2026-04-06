import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

// GET form details + responses
export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const form = await db.form.findUnique({
    where: { id },
    include: {
      organization: { select: { name: true, logo: true } },
      responses: {
        include: {
          startup: { select: { name: true } },
          user: { select: { name: true } },
        },
        orderBy: { createdAt: "desc" },
      },
    },
  });

  if (!form) {
    return NextResponse.json({ error: "Form not found" }, { status: 404 });
  }

  // If not public and not the org admin, check auth
  if (!form.isPublic) {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
  }

  return NextResponse.json(form);
}

// POST — submit a response
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const form = await db.form.findUnique({ where: { id } });
  if (!form || !form.isActive) {
    return NextResponse.json({ error: "Form not found or inactive" }, { status: 404 });
  }

  try {
    const body = await req.json();
    const { data, respondentName, respondentEmail, respondentPhone } = body;

    if (!data) {
      return NextResponse.json({ error: "Response data required" }, { status: 400 });
    }

    // Check auth for non-public forms
    let userId: string | null = null;
    let startupId: string | null = null;

    if (form.type !== "CALL_FOR_ENTRIES") {
      const session = await auth();
      if (!session?.user) {
        return NextResponse.json({ error: "Login required for this form" }, { status: 401 });
      }
      userId = session.user.id;

      if (form.type === "INVESTMENT" && session.user.role === "STARTUP_FOUNDER") {
        const startup = await db.startup.findFirst({
          where: { founders: { some: { id: session.user.id } } },
          select: { id: true },
        });
        startupId = startup?.id || null;
      }
    }

    const response = await db.formResponse.create({
      data: {
        formId: id,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        data: JSON.parse(JSON.stringify(data)) as any,
        respondentName: respondentName || null,
        respondentEmail: respondentEmail || null,
        respondentPhone: respondentPhone || null,
        userId,
        startupId,
      },
    });

    // Notify org admins
    const admins = await db.user.findMany({
      where: { organizationId: form.organizationId, role: "INCUBATOR_ADMIN" },
      select: { id: true },
    });
    if (admins.length > 0) {
      await db.notification.createMany({
        data: admins.map((a) => ({
          userId: a.id,
          type: "form_response",
          title: `New Form Response: ${form.title}`,
          message: `${respondentName || "Someone"} submitted a response to "${form.title}"`,
          link: `/incubator/forms`,
        })),
      });
    }

    return NextResponse.json(response, { status: 201 });
  } catch (error) {
    console.error("Form response error:", error);
    return NextResponse.json({ error: "Failed to submit" }, { status: 500 });
  }
}
