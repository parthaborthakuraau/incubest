"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BackButton } from "@/components/ui/back-button";
import { Search, Shield, AlertTriangle, Building2, MapPin, ExternalLink } from "lucide-react";
import Link from "next/link";

interface SearchResult {
  id: string;
  name: string;
  passportId: string | null;
  slug: string;
  sector: string;
  stage: string;
  city: string | null;
  state: string | null;
  dpiitNumber: string | null;
  cinNumber: string | null;
  alumniStatus: string;
  incubator: string;
  incubatorCity: string | null;
  incubatorState: string | null;
  isOwnOrg: boolean;
  cohort: string;
  program: string | null;
  programType: string | null;
  founders: { name: string; email: string; passportId: string | null }[];
  createdAt: string;
}

export default function PassportSearchPage() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  async function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    if (!query.trim() || query.length < 2) return;

    setLoading(true);
    setSearched(true);
    const res = await fetch(`/api/passport/search?q=${encodeURIComponent(query)}`);
    if (res.ok) {
      setResults(await res.json());
    }
    setLoading(false);
  }

  return (
    <div className="space-y-6">
      <BackButton />
      <div>
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <Shield className="h-6 w-6 text-brand-600" />
          Passport Search
        </h1>
        <p className="text-sm text-gray-500">
          Verify a startup or founder before inducting. Search by Passport ID, DPIIT number, CIN, PAN, email, or name.
        </p>
      </div>

      {/* Search form */}
      <form onSubmit={handleSearch}>
        <div className="relative">
          <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Enter Passport ID, DPIIT number, CIN, PAN, email, or startup name..."
            className="w-full rounded-xl border-2 border-gray-200 bg-white py-4 pl-12 pr-4 text-base focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-200"
          />
        </div>
      </form>

      {/* Results */}
      {loading && (
        <div className="flex h-32 items-center justify-center">
          <p className="text-gray-500">Searching across all incubators...</p>
        </div>
      )}

      {searched && !loading && results.length === 0 && (
        <Card>
          <CardContent className="py-12 text-center">
            <Search className="mx-auto h-12 w-12 text-gray-300" />
            <h3 className="mt-4 text-lg font-medium text-gray-900">No results found</h3>
            <p className="mt-2 text-sm text-gray-500">
              No startup or founder matches &quot;{query}&quot; across the Incubest network.
            </p>
          </CardContent>
        </Card>
      )}

      {results.length > 0 && (
        <div className="space-y-4">
          <p className="text-sm text-gray-500">{results.length} result(s) found</p>

          {results.map((r) => (
            <Card
              key={r.id}
              className={!r.isOwnOrg ? "border-yellow-200 bg-yellow-50/30" : ""}
            >
              <CardContent className="p-5">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-lg font-semibold">{r.name}</h3>
                      {r.passportId && (
                        <Badge variant="outline" className="font-mono text-xs">
                          {r.passportId}
                        </Badge>
                      )}
                    </div>

                    <div className="mt-1 flex flex-wrap items-center gap-2">
                      <Badge variant="secondary">{r.sector.replace(/_/g, " ")}</Badge>
                      <Badge variant="outline">{r.stage.replace(/_/g, " ")}</Badge>
                      {r.dpiitNumber && <Badge variant="outline">DPIIT: {r.dpiitNumber}</Badge>}
                    </div>

                    {/* Founders */}
                    <div className="mt-3">
                      <p className="text-xs font-medium text-gray-500">Founders</p>
                      <div className="mt-1 space-y-1">
                        {r.founders.map((f, i) => (
                          <div key={i} className="flex items-center gap-2 text-sm">
                            <span className="font-medium">{f.name}</span>
                            <span className="text-gray-400">{f.email}</span>
                            {f.passportId && (
                              <Badge variant="outline" className="text-[10px] font-mono">
                                {f.passportId}
                              </Badge>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  <Link href={`/passport/${r.slug}`} target="_blank">
                    <Badge variant="default" className="cursor-pointer">
                      <ExternalLink className="mr-1 h-3 w-3" /> Passport
                    </Badge>
                  </Link>
                </div>

                {/* Incubation details */}
                <div className="mt-4 rounded-lg border p-3">
                  <div className="flex items-center gap-2">
                    <Building2 className="h-4 w-4 text-gray-400" />
                    <span className="text-sm font-medium">{r.incubator}</span>
                    {r.isOwnOrg && <Badge variant="success">Your Org</Badge>}
                    {!r.isOwnOrg && (
                      <Badge variant="warning">
                        <AlertTriangle className="mr-1 h-3 w-3" />
                        Different Incubator
                      </Badge>
                    )}
                  </div>
                  <div className="mt-1 flex flex-wrap gap-3 text-xs text-gray-500">
                    {(r.incubatorCity || r.incubatorState) && (
                      <span className="flex items-center gap-1">
                        <MapPin className="h-3 w-3" />
                        {[r.incubatorCity, r.incubatorState].filter(Boolean).join(", ")}
                      </span>
                    )}
                    <span>Cohort: {r.cohort}</span>
                    {r.program && <span>Program: {r.program}</span>}
                    <span>Since: {new Date(r.createdAt).toLocaleDateString("en-IN")}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
