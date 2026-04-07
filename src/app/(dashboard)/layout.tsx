import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { MobileLayout } from "@/components/dashboard/mobile-layout";
import { ErrorBoundary } from "@/components/error-boundary";
import { db } from "@/lib/db";
import { isIncubatorRole } from "@/lib/roles";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  const role = isIncubatorRole(session.user.role) ? "incubator" : "startup";

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const sessionUser = session.user as any;

  let orgName: string | undefined;
  if (sessionUser.organizationId) {
    const org = await db.organization.findUnique({
      where: { id: sessionUser.organizationId },
      select: { name: true },
    });
    orgName = org?.name;
  }

  return (
    <MobileLayout
      role={role}
      orgName={orgName}
      teamRole={sessionUser.teamRole || null}
      assignedProgramId={sessionUser.assignedProgramId || null}
    >
      <ErrorBoundary>{children}</ErrorBoundary>
    </MobileLayout>
  );
}
