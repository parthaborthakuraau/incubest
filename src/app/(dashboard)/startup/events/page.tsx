import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { redirect } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CalendarDays, MapPin, Video } from "lucide-react";

const typeLabels: Record<string, string> = {
  hackathon: "Hackathon",
  workshop: "Workshop",
  demo_day: "Demo Day",
  bootcamp: "Bootcamp",
  investor_meet: "Investor Meet",
  seminar: "Seminar",
  session: "Session",
};

export default async function StartupEventsPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const startupId = session.user.startupId;
  if (!startupId) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-gray-900">Events</h1>
        <Card>
          <CardContent className="py-12 text-center">
            <CalendarDays className="mx-auto h-12 w-12 text-gray-300" />
            <h3 className="mt-4 text-lg font-medium text-gray-900">
              No startup profile found
            </h3>
            <p className="mt-2 text-sm text-gray-500">
              Please complete your startup setup first.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const attendances = await db.eventAttendance.findMany({
    where: { startupId },
    include: {
      event: true,
    },
    orderBy: { event: { date: "desc" } },
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Events</h1>
        <p className="text-sm text-gray-500">
          Events and workshops you have been invited to
        </p>
      </div>

      {attendances.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <CalendarDays className="mx-auto h-12 w-12 text-gray-300" />
            <h3 className="mt-4 text-lg font-medium text-gray-900">
              No events yet
            </h3>
            <p className="mt-2 text-sm text-gray-500">
              You will see events here once your incubator adds you to one.
            </p>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>Your Events</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {attendances.map((attendance) => {
                const event = attendance.event;
                return (
                  <div
                    key={attendance.id}
                    className="flex items-center justify-between rounded-lg border border-gray-100 p-4"
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-sm font-medium text-gray-900">
                          {event.name}
                        </span>
                        <Badge variant="secondary">
                          {typeLabels[event.type] || event.type}
                        </Badge>
                        {event.isVirtual && (
                          <Badge variant="outline">
                            <Video className="mr-1 h-3 w-3" />
                            Virtual
                          </Badge>
                        )}
                      </div>
                      <div className="mt-1 flex items-center gap-3 text-xs text-gray-500">
                        <span className="flex items-center gap-1">
                          <CalendarDays className="h-3 w-3" />
                          {new Date(event.date).toLocaleDateString("en-IN", {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                          })}
                        </span>
                        {event.venue && (
                          <span className="flex items-center gap-1">
                            <MapPin className="h-3 w-3" />
                            {event.venue}
                          </span>
                        )}
                      </div>
                    </div>
                    <Badge
                      variant={attendance.attended ? "success" : "destructive"}
                    >
                      {attendance.attended ? "Attended" : "Not Attended"}
                    </Badge>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
