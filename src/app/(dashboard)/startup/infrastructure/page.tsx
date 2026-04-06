import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { redirect } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Building2, MapPin, Users, Calendar } from "lucide-react";

const typeLabels: Record<string, string> = {
  CO_WORKING: "Co-working",
  PRIVATE_OFFICE: "Private Office",
  LAB: "Lab",
  MEETING_ROOM: "Meeting Room",
  EQUIPMENT: "Equipment",
  WORKSHOP_AREA: "Workshop Area",
};

export default async function StartupInfrastructurePage() {
  const session = await auth();
  if (!session?.user || session.user.role !== "STARTUP_FOUNDER") {
    redirect("/login");
  }

  const startup = await db.startup.findFirst({
    where: { founders: { some: { id: session.user.id } } },
    include: {
      spaceAllocations: {
        where: { isActive: true },
        include: {
          space: true,
        },
        orderBy: { startDate: "desc" },
      },
    },
  });

  if (!startup) {
    return (
      <div className="flex h-64 items-center justify-center">
        <p className="text-gray-500">No startup found for your account.</p>
      </div>
    );
  }

  const allocations = startup.spaceAllocations;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">My Workspace</h1>
        <p className="text-sm text-gray-500">
          Spaces and resources allocated to your startup
        </p>
      </div>

      {allocations.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <Building2 className="mx-auto h-12 w-12 text-gray-300" />
            <h3 className="mt-4 text-lg font-medium text-gray-900">
              No spaces allocated
            </h3>
            <p className="mt-2 text-sm text-gray-500">
              Your incubator has not allocated any spaces to your startup yet.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {allocations.map((alloc) => (
            <Card key={alloc.id}>
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-semibold text-gray-900">{alloc.space.name}</h3>
                    <Badge variant="secondary" className="mt-1">
                      {typeLabels[alloc.space.type] ?? alloc.space.type}
                    </Badge>
                  </div>
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-brand-100">
                    <Building2 className="h-5 w-5 text-brand-600" />
                  </div>
                </div>

                {alloc.space.description && (
                  <p className="mt-3 text-sm text-gray-600 line-clamp-2">
                    {alloc.space.description}
                  </p>
                )}

                <div className="mt-4 space-y-2 text-sm text-gray-500">
                  {alloc.space.location && (
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4" />
                      <span>{alloc.space.location}</span>
                    </div>
                  )}
                  {alloc.space.capacity && (
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4" />
                      <span>Capacity: {alloc.space.capacity}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    <span>
                      Since{" "}
                      {new Date(alloc.startDate).toLocaleDateString("en-IN", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </span>
                  </div>
                </div>

                {alloc.notes && (
                  <p className="mt-3 text-xs text-gray-400">{alloc.notes}</p>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
