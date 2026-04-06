"use client";

import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Building2, MapPin, CheckCircle2 } from "lucide-react";

interface IncubatorInfo {
  startupId: string;
  startupName: string;
  passportId: string | null;
  organization: { id: string; name: string; city: string | null; state: string | null; logo: string | null };
  program: { id: string; name: string; type: string; grantor: string | null } | null;
  cohort: string;
  stage: string;
  onboardingStatus: string;
  isActive: boolean;
}

export default function MyIncubatorsPage() {
  const [incubators, setIncubators] = useState<IncubatorInfo[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/startup/dashboard")
      .then((res) => res.json())
      .then((data) => {
        setIncubators(data.incubators || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  async function switchStartup(startupId: string) {
    await fetch("/api/startup/switch", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ startupId }),
    });
    window.location.reload();
  }

  if (loading) return <div className="flex h-64 items-center justify-center"><p className="text-gray-500">Loading...</p></div>;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">My Incubators</h1>
        <p className="text-sm text-gray-500">
          {incubators.length === 1
            ? "Your incubator association"
            : `You're part of ${incubators.length} incubators`}
        </p>
      </div>

      {incubators.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <Building2 className="mx-auto h-12 w-12 text-gray-300" />
            <h3 className="mt-4 text-lg font-medium text-gray-900">No incubators yet</h3>
            <p className="mt-2 text-sm text-gray-500">
              You&apos;ll see your incubators here once you join through an invite link.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {incubators.map((inc) => (
            <Card
              key={inc.startupId}
              className={inc.isActive ? "border-brand-300 ring-2 ring-brand-100" : ""}
            >
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-4">
                    {inc.organization.logo ? (
                      <img src={inc.organization.logo} alt="" className="h-12 w-12 rounded-lg object-cover" />
                    ) : (
                      <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-brand-50">
                        <Building2 className="h-6 w-6 text-brand-600" />
                      </div>
                    )}
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-lg font-semibold">{inc.organization.name}</h3>
                        {inc.isActive && (
                          <Badge variant="success" className="flex items-center gap-1">
                            <CheckCircle2 className="h-3 w-3" /> Active
                          </Badge>
                        )}
                      </div>
                      {(inc.organization.city || inc.organization.state) && (
                        <p className="mt-0.5 flex items-center gap-1 text-sm text-gray-500">
                          <MapPin className="h-3.5 w-3.5" />
                          {[inc.organization.city, inc.organization.state].filter(Boolean).join(", ")}
                        </p>
                      )}
                      <div className="mt-2 flex flex-wrap gap-2">
                        {inc.program && <Badge variant="secondary">{inc.program.name}</Badge>}
                        <Badge variant="outline">{inc.cohort}</Badge>
                        <Badge variant="outline">{inc.stage.replace(/_/g, " ")}</Badge>
                      </div>
                      <div className="mt-2 flex items-center gap-3">
                        <p className="text-xs text-gray-400">Startup: {inc.startupName}</p>
                        {inc.passportId && (
                          <span className="text-xs font-mono text-brand-600">{inc.passportId}</span>
                        )}
                      </div>
                    </div>
                  </div>

                  {!inc.isActive && (
                    <Button size="sm" onClick={() => switchStartup(inc.startupId)}>
                      Switch
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
