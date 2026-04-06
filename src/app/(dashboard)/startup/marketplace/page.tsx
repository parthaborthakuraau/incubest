"use client";

import { useState, useEffect, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Search, ShoppingBag, MapPin, Building2, Send,
  CheckCircle2, Clock, XCircle, Filter,
} from "lucide-react";

interface ServiceListing {
  id: string; title: string; description: string | null;
  category: string; pricingType: string; price: number | null;
  priceUnit: string | null; availability: string;
  city: string | null; state: string | null;
  organization: { id: string; name: string; city: string | null; state: string | null; logo: string | null };
  myRequestStatus: string | null;
  myRequestNotes: string | null;
}

const CATEGORY_LABELS: Record<string, string> = {
  LAB_TESTING: "Lab Testing", PROTOTYPING: "Prototyping", WORKSPACE: "Workspace",
  LEGAL: "Legal", ACCOUNTING: "Accounting", DESIGN: "Design",
  TECHNOLOGY: "Technology", MENTORING: "Mentoring", FUNDING: "Funding",
  MARKETING: "Marketing", EVENTS: "Events", EQUIPMENT_ACCESS: "Equipment Access",
  AWS_CREDITS: "Cloud Credits", OTHER: "Other",
};

const STATUS_CONFIG: Record<string, { icon: typeof CheckCircle2; label: string; color: string }> = {
  REQUESTED: { icon: Clock, label: "Requested", color: "text-yellow-600" },
  APPROVED: { icon: CheckCircle2, label: "Approved", color: "text-green-600" },
  REJECTED: { icon: XCircle, label: "Declined", color: "text-red-500" },
  COMPLETED: { icon: CheckCircle2, label: "Completed", color: "text-blue-600" },
};

export default function MarketplacePage() {
  const [listings, setListings] = useState<ServiceListing[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterCategory, setFilterCategory] = useState("");
  const [filterState, setFilterState] = useState("");
  const [requesting, setRequesting] = useState<string | null>(null);
  const [messageFor, setMessageFor] = useState<string | null>(null);
  const [message, setMessage] = useState("");

  useEffect(() => { fetchListings(); }, []);

  async function fetchListings() {
    const res = await fetch("/api/services");
    if (res.ok) {
      const data = await res.json();
      setListings(data.listings || []);
    }
    setLoading(false);
  }

  async function requestAccess(listingId: string) {
    setRequesting(listingId);
    await fetch("/api/services/request", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ listingId, message: message || null }),
    });
    setMessage("");
    setMessageFor(null);
    fetchListings();
    setRequesting(null);
  }

  const filtered = useMemo(() => {
    let result = [...listings];
    if (search) {
      const q = search.toLowerCase();
      result = result.filter((l) =>
        l.title.toLowerCase().includes(q) ||
        l.description?.toLowerCase().includes(q) ||
        l.organization.name.toLowerCase().includes(q)
      );
    }
    if (filterCategory) result = result.filter((l) => l.category === filterCategory);
    if (filterState) result = result.filter((l) => l.state?.toLowerCase().includes(filterState.toLowerCase()) || l.organization.state?.toLowerCase().includes(filterState.toLowerCase()));
    return result;
  }, [listings, search, filterCategory, filterState]);

  const categories = [...new Set(listings.map((l) => l.category))];
  const states = [...new Set(listings.map((l) => l.state || l.organization.state).filter(Boolean))];

  if (loading) return <div className="flex h-64 items-center justify-center"><p className="text-gray-500">Loading marketplace...</p></div>;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <ShoppingBag className="h-6 w-6 text-brand-600" />
          Marketplace
        </h1>
        <p className="text-sm text-gray-500">
          Discover facilities and services from incubators across India
        </p>
      </div>

      {/* Search + Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <input
            value={search} onChange={(e) => setSearch(e.target.value)}
            placeholder="Search services, incubators..."
            className="w-full rounded-lg border border-gray-300 bg-white py-2 pl-10 pr-3 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
          />
        </div>
        <select value={filterCategory} onChange={(e) => setFilterCategory(e.target.value)} className="rounded-lg border border-gray-300 px-3 py-2 text-sm">
          <option value="">All Categories</option>
          {categories.map((c) => <option key={c} value={c}>{CATEGORY_LABELS[c] || c}</option>)}
        </select>
        <select value={filterState} onChange={(e) => setFilterState(e.target.value)} className="rounded-lg border border-gray-300 px-3 py-2 text-sm">
          <option value="">All States</option>
          {states.map((s) => <option key={s} value={s!}>{s}</option>)}
        </select>
        <Badge variant="outline">{filtered.length} services</Badge>
      </div>

      {/* Listings */}
      {filtered.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <ShoppingBag className="mx-auto h-12 w-12 text-gray-300" />
            <h3 className="mt-4 text-lg font-medium text-gray-900">
              {listings.length === 0 ? "No services available yet" : "No results match your filters"}
            </h3>
            <p className="mt-2 text-sm text-gray-500">
              Check back later — incubators are adding services regularly.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filtered.map((l) => {
            const status = l.myRequestStatus ? STATUS_CONFIG[l.myRequestStatus] : null;
            const isShowingMessage = messageFor === l.id;

            return (
              <Card key={l.id} className="flex flex-col">
                <CardContent className="flex-1 p-5">
                  {/* Category + pricing */}
                  <div className="flex items-center justify-between mb-2">
                    <Badge variant="secondary">{CATEGORY_LABELS[l.category] || l.category}</Badge>
                    <Badge variant={l.pricingType === "FREE" ? "success" : "outline"}>
                      {l.pricingType === "FREE" ? "Free" : l.pricingType === "PAID" ? `₹${l.price}${l.priceUnit ? `/${l.priceUnit}` : ""}` : "Contact Us"}
                    </Badge>
                  </div>

                  {/* Title + description */}
                  <h3 className="font-semibold text-gray-900">{l.title}</h3>
                  {l.description && (
                    <p className="mt-1 text-sm text-gray-500 line-clamp-2">{l.description}</p>
                  )}

                  {/* Incubator */}
                  <div className="mt-3 flex items-center gap-2 text-sm text-gray-600">
                    <Building2 className="h-3.5 w-3.5" />
                    <span className="font-medium">{l.organization.name}</span>
                  </div>
                  {(l.city || l.state || l.organization.city || l.organization.state) && (
                    <p className="mt-0.5 flex items-center gap-1 text-xs text-gray-400">
                      <MapPin className="h-3 w-3" />
                      {[l.city || l.organization.city, l.state || l.organization.state].filter(Boolean).join(", ")}
                    </p>
                  )}

                  <div className="mt-1">
                    <Badge variant="outline" className="text-[10px]">{l.availability.replace(/_/g, " ")}</Badge>
                  </div>

                  {/* Action */}
                  <div className="mt-4 pt-3 border-t">
                    {status ? (
                      <div>
                        <div className={`flex items-center gap-2 text-sm ${status.color}`}>
                          <status.icon className="h-4 w-4" />
                          {status.label}
                        </div>
                        {l.myRequestNotes && l.myRequestStatus === "APPROVED" && (
                          <div className="mt-2 rounded-lg bg-green-50 border border-green-200 p-2">
                            <p className="text-[10px] font-medium text-green-700 uppercase">Contact / Next Steps</p>
                            <p className="text-sm text-green-800 mt-0.5">{l.myRequestNotes}</p>
                          </div>
                        )}
                      </div>
                    ) : (
                      <>
                        {isShowingMessage ? (
                          <div className="space-y-2">
                            <textarea
                              value={message} onChange={(e) => setMessage(e.target.value)}
                              placeholder="Optional message to the incubator..."
                              rows={2}
                              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                            />
                            <div className="flex gap-2">
                              <Button size="sm" onClick={() => requestAccess(l.id)} disabled={requesting === l.id}>
                                <Send className="mr-1 h-3 w-3" /> {requesting === l.id ? "Sending..." : "Send Request"}
                              </Button>
                              <Button size="sm" variant="ghost" onClick={() => { setMessageFor(null); setMessage(""); }}>
                                Cancel
                              </Button>
                            </div>
                          </div>
                        ) : (
                          <Button size="sm" className="w-full" onClick={() => setMessageFor(l.id)}>
                            Request Access
                          </Button>
                        )}
                      </>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
