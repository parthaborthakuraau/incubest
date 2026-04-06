import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import Groq from "groq-sdk";
import { rateLimit } from "@/lib/rate-limit";

function getGroqClient() {
  return new Groq({ apiKey: process.env.GROQ_API_KEY });
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Rate limit: 20 requests per minute per user
  const { success } = rateLimit(`chat:${session.user.id}`, 20, 60000);
  if (!success) {
    return NextResponse.json({ error: "Too many requests. Please wait a moment." }, { status: 429 });
  }

  try {
    const { message, history } = await req.json();

    // Gather context based on user role
    let context = "";

    if (session.user.role === "INCUBATOR_ADMIN" && session.user.organizationId) {
      const org = await db.organization.findUnique({
        where: { id: session.user.organizationId },
        include: {
          cohorts: {
            include: {
              startups: {
                select: {
                  name: true,
                  sector: true,
                  stage: true,
                  employeesCount: true,
                  revenue: true,
                  funding: true,
                  customersCount: true,
                  city: true,
                  state: true,
                  dpiitRecognized: true,
                },
              },
              _count: { select: { startups: true } },
            },
          },
        },
      });

      if (org) {
        context = `You are an AI assistant for the incubator "${org.name}".
Here is the current data:

Organization: ${org.name} (${org.city}, ${org.state})

Cohorts:
${org.cohorts
  .map(
    (c) => `
- ${c.name} (${c.isActive ? "Active" : "Completed"}, ${c._count.startups} startups)
  Startups:
${c.startups
  .map(
    (s) =>
      `    - ${s.name}: Sector=${s.sector}, Stage=${s.stage}, Employees=${s.employeesCount}, Revenue=₹${s.revenue}, Funding=₹${s.funding}, Customers=${s.customersCount}, City=${s.city}, DPIIT=${s.dpiitRecognized}`
  )
  .join("\n")}`
  )
  .join("\n")}

Answer questions accurately based on this data. If asked to generate a report, format it clearly. If you don't have enough data, say so. Be concise and helpful. Use Indian number formatting (lakhs, crores).`;
      }
    } else if (session.user.role === "STARTUP_FOUNDER") {
      const startup = await db.startup.findFirst({
        where: { founders: { some: { id: session.user.id } } },
        include: {
          cohort: {
            select: { name: true, organization: { select: { name: true } } },
          },
          reports: {
            orderBy: [{ year: "desc" }, { month: "desc" }],
            take: 12,
          },
          milestones: { include: { template: true } },
          funds: true,
        },
      });

      if (startup) {
        context = `You are an AI advisor for the startup "${startup.name}".
You act as a helpful co-founder, advisor, and strategic partner.

Startup: ${startup.name}
Sector: ${startup.sector}
Stage: ${startup.stage}
Incubator: ${startup.cohort.organization.name} (${startup.cohort.name})
Employees: ${startup.employeesCount}
Revenue: ₹${startup.revenue}
Funding: ₹${startup.funding}
Customers: ${startup.customersCount}
DPIIT Recognized: ${startup.dpiitRecognized}

Recent reports: ${startup.reports.length} submitted
Milestones: ${startup.milestones.map((m) => `${m.template.name}: ${m.status}`).join(", ")}
Funds: ${startup.funds.map((f) => `${f.name}: ₹${f.amount} (${f.status})`).join(", ")}

Provide actionable advice. Help with strategy, metrics understanding (ARR, MRR, TAM, etc.), fundraising advice, and growth tactics. Be concise and practical.`;
      }
    }

    const messages = [
      {
        role: "system" as const,
        content: context || "You are a helpful assistant for a startup incubator platform called Incubest.",
      },
      ...(history || []).map((h: { role: string; content: string }) => ({
        role: h.role as "user" | "assistant",
        content: h.content,
      })),
      { role: "user" as const, content: message },
    ];

    const response = await getGroqClient().chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages,
      max_tokens: 1024,
      temperature: 0.7,
    });

    const assistantMessage = response.choices[0]?.message?.content || "";

    return NextResponse.json({ response: assistantMessage });
  } catch (error) {
    console.error("Chat error:", error);
    return NextResponse.json(
      { error: "Failed to process chat" },
      { status: 500 }
    );
  }
}
