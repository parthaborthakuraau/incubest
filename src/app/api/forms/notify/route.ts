import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

// POST — notify startups about an investment form
export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user || session.user.role !== "INCUBATOR_ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { formId, startupIds } = await req.json();

  const form = await db.form.findFirst({
    where: { id: formId, organizationId: session.user.organizationId! },
  });

  if (!form) return NextResponse.json({ error: "Form not found" }, { status: 404 });

  // Find founders of the target startups
  const founders = await db.user.findMany({
    where: {
      role: "STARTUP_FOUNDER",
      startups: { some: { id: { in: startupIds } } },
    },
    select: { id: true },
  });

  if (founders.length > 0) {
    await db.notification.createMany({
      data: founders.map(f => ({
        userId: f.id,
        type: "form_request",
        title: `New Form: ${form.title}`,
        message: `Your incubator has sent you a form to fill: "${form.title}"${form.deadline ? `. Due: ${new Date(form.deadline).toLocaleDateString("en-IN")}` : ""}`,
        link: `/forms/${form.id}`,
      })),
    });
  }

  // Save target startup IDs on the form
  await db.form.update({
    where: { id: formId },
    data: { targetStartupIds: startupIds },
  });

  return NextResponse.json({ notified: founders.length });
}
