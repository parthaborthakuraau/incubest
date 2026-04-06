"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { BackButton } from "@/components/ui/back-button";
import {
  Plus, X, Trash2, ShoppingBag, CheckCircle2, XCircle, Clock,
  ChevronDown, ChevronUp,
} from "lucide-react";

interface ServiceRequest {
  id: string; status: string; message: string | null; notes: string | null;
  createdAt: string;
  startup: { id: string; name: string; passportId: string | null };
}

interface ServiceListing {
  id: string; title: string; description: string | null;
  image: string | null;
  category: string; pricingType: string; price: number | null;
  priceUnit: string | null; availability: string; isActive: boolean;
  city: string | null; state: string | null;
  _count: { requests: number };
  requests: ServiceRequest[];
}

const CATEGORIES = [
  "LAB_TESTING", "PROTOTYPING", "WORKSPACE", "LEGAL", "ACCOUNTING",
  "DESIGN", "TECHNOLOGY", "MENTORING", "FUNDING", "MARKETING",
  "EVENTS", "EQUIPMENT_ACCESS", "AWS_CREDITS", "OTHER",
];

const CATEGORY_LABELS: Record<string, string> = {
  LAB_TESTING: "Lab Testing", PROTOTYPING: "Prototyping", WORKSPACE: "Workspace",
  LEGAL: "Legal", ACCOUNTING: "Accounting", DESIGN: "Design",
  TECHNOLOGY: "Technology", MENTORING: "Mentoring", FUNDING: "Funding",
  MARKETING: "Marketing", EVENTS: "Events", EQUIPMENT_ACCESS: "Equipment Access",
  AWS_CREDITS: "Cloud Credits", OTHER: "Other",
};

const STATUS_BADGE: Record<string, "warning" | "success" | "secondary" | "default"> = {
  REQUESTED: "warning", APPROVED: "success", REJECTED: "secondary", COMPLETED: "default",
};

export default function IncubatorServicesPage() {
  const [listings, setListings] = useState<ServiceListing[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  useEffect(() => { fetchListings(); }, []);

  async function fetchListings() {
    const res = await fetch("/api/services");
    if (res.ok) setListings(await res.json());
    setLoading(false);
  }

  async function handleCreate(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSubmitting(true);
    const fd = new FormData(e.currentTarget);

    // Upload image if provided
    let imageUrl: string | null = null;
    const fileInput = e.currentTarget.querySelector('input[name="image"]') as HTMLInputElement;
    if (fileInput?.files?.[0]) {
      const uploadFd = new FormData();
      uploadFd.append("file", fileInput.files[0]);
      const uploadRes = await fetch("/api/upload", { method: "POST", body: uploadFd });
      if (uploadRes.ok) {
        const uploaded = await uploadRes.json();
        imageUrl = uploaded.url;
      }
    }

    const res = await fetch("/api/services", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: fd.get("title"), description: fd.get("description"),
        category: fd.get("category"), pricingType: fd.get("pricingType"),
        price: fd.get("price"), priceUnit: fd.get("priceUnit"),
        availability: fd.get("availability"), city: fd.get("city"), state: fd.get("state"),
        image: imageUrl,
      }),
    });
    if (res.ok) { setShowForm(false); fetchListings(); }
    setSubmitting(false);
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this service listing?")) return;
    await fetch(`/api/services?id=${id}`, { method: "DELETE" });
    fetchListings();
  }

  async function handleRequestAction(requestId: string, status: string) {
    let notes: string | null = null;
    if (status === "APPROVED") {
      notes = prompt("Add contact info or instructions for the startup (e.g. email, phone, next steps):");
      if (notes === null) return; // cancelled
    }
    await fetch("/api/services/request", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ requestId, status, notes }),
    });
    fetchListings();
  }

  const pendingRequests = listings.reduce((sum, l) => sum + l.requests.filter((r) => r.status === "REQUESTED").length, 0);

  if (loading) return <div className="flex h-64 items-center justify-center"><p className="text-gray-500">Loading...</p></div>;

  return (
    <div className="space-y-6">
      <BackButton />
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Services & Facilities</h1>
          <p className="text-sm text-gray-500">
            List your facilities for startups across the Incubest network
            {pendingRequests > 0 && <span className="ml-2 text-yellow-600 font-medium">({pendingRequests} pending requests)</span>}
          </p>
        </div>
        <Button onClick={() => setShowForm(!showForm)}>
          {showForm ? <><X className="mr-2 h-4 w-4" /> Cancel</> : <><Plus className="mr-2 h-4 w-4" /> Add Service</>}
        </Button>
      </div>

      {showForm && (
        <Card>
          <CardHeader><CardTitle>List a Service</CardTitle></CardHeader>
          <CardContent>
            <form onSubmit={handleCreate} className="space-y-4">
              <Input label="Service Title" name="title" placeholder="e.g. NABL Accredited Lab Testing" required />
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">Photo (optional)</label>
                <input
                  name="image"
                  type="file"
                  accept="image/*"
                  className="block w-full text-sm text-gray-500 file:mr-4 file:rounded-lg file:border-0 file:bg-brand-50 file:px-4 file:py-2 file:text-sm file:font-medium file:text-brand-700 hover:file:bg-brand-100"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">Description</label>
                <textarea name="description" rows={2} placeholder="What does this service include?" className="flex w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500" />
              </div>
              <div className="grid gap-4 sm:grid-cols-3">
                <div className="space-y-1">
                  <label className="block text-sm font-medium text-gray-700">Category</label>
                  <select name="category" required className="flex h-10 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm">
                    {CATEGORIES.map((c) => <option key={c} value={c}>{CATEGORY_LABELS[c]}</option>)}
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="block text-sm font-medium text-gray-700">Pricing</label>
                  <select name="pricingType" className="flex h-10 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm">
                    <option value="CONTACT_US">Contact Us</option>
                    <option value="PAID">Paid</option>
                    <option value="FREE">Free</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="block text-sm font-medium text-gray-700">Availability</label>
                  <select name="availability" className="flex h-10 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm">
                    <option value="AVAILABLE">Available</option>
                    <option value="LIMITED">Limited</option>
                    <option value="BY_APPOINTMENT">By Appointment</option>
                  </select>
                </div>
              </div>
              <div className="grid gap-4 sm:grid-cols-3">
                <Input label="Price (INR)" name="price" type="number" placeholder="0" />
                <Input label="Price Unit" name="priceUnit" placeholder="per test, per hour" />
                <div className="grid grid-cols-2 gap-2">
                  <Input label="City" name="city" />
                  <Input label="State" name="state" />
                </div>
              </div>
              <Button type="submit" disabled={submitting}>{submitting ? "Creating..." : "List Service"}</Button>
            </form>
          </CardContent>
        </Card>
      )}

      {listings.length === 0 && !showForm ? (
        <Card>
          <CardContent className="py-12 text-center">
            <ShoppingBag className="mx-auto h-12 w-12 text-gray-300" />
            <h3 className="mt-4 text-lg font-medium text-gray-900">No services listed</h3>
            <p className="mt-2 text-sm text-gray-500">List your facilities so startups across India can discover and request access.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {listings.map((l) => {
            const isExpanded = expandedId === l.id;
            const pending = l.requests.filter((r) => r.status === "REQUESTED").length;
            return (
              <Card key={l.id} className="overflow-hidden">
                {/* Thumbnail */}
                {l.image ? (
                  <div className="h-40 w-full overflow-hidden bg-gray-100">
                    <img src={l.image} alt={l.title} className="h-full w-full object-cover" />
                  </div>
                ) : (
                  <div className="flex h-28 w-full items-center justify-center bg-gray-50">
                    <ShoppingBag className="h-8 w-8 text-gray-300" />
                  </div>
                )}
                <CardContent className="p-5">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h3 className="font-semibold text-gray-900">{l.title}</h3>
                      {l.description && <p className="mt-0.5 text-xs text-gray-500 line-clamp-2">{l.description}</p>}
                    </div>
                    <Button variant="ghost" size="icon" onClick={(e) => { e.stopPropagation(); handleDelete(l.id); }} className="shrink-0 text-gray-400 hover:text-red-500">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>

                  <div className="mt-3 flex flex-wrap items-center gap-1.5">
                    <Badge variant="secondary">{CATEGORY_LABELS[l.category] || l.category}</Badge>
                    <Badge variant="outline">
                      {l.pricingType === "FREE" ? "Free" : l.pricingType === "PAID" ? `₹${l.price}${l.priceUnit ? `/${l.priceUnit}` : ""}` : "Contact Us"}
                    </Badge>
                    <Badge variant="outline">{l.availability.replace(/_/g, " ")}</Badge>
                  </div>

                  {/* Request summary */}
                  <div className="mt-3 flex items-center justify-between border-t border-gray-100 pt-3">
                    <button onClick={() => setExpandedId(isExpanded ? null : l.id)} className="text-xs text-gray-500 hover:text-gray-700">
                      {l._count.requests} request(s) {pending > 0 && <span className="text-yellow-600 font-medium">({pending} pending)</span>}
                    </button>
                    <button onClick={() => setExpandedId(isExpanded ? null : l.id)} className="text-gray-400">
                      {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                    </button>
                  </div>
                </CardContent>
                {isExpanded && (
                  <CardContent className="border-t pt-4">
                    {l.description && <p className="mb-3 text-sm text-gray-500">{l.description}</p>}
                    {l.requests.length === 0 ? (
                      <p className="text-sm text-gray-400">No requests yet.</p>
                    ) : (
                      <div className="space-y-2">
                        <p className="text-sm font-medium text-gray-700">{l.requests.length} request(s)</p>
                        {l.requests.map((r) => (
                          <div key={r.id} className="flex items-center justify-between rounded-lg border p-3">
                            <div>
                              <div className="flex items-center gap-2">
                                <p className="text-sm font-medium">{r.startup.name}</p>
                                {r.startup.passportId && (
                                  <Badge variant="outline" className="text-[10px] font-mono">{r.startup.passportId}</Badge>
                                )}
                              </div>
                              {r.message && <p className="mt-0.5 text-xs text-gray-500">&ldquo;{r.message}&rdquo;</p>}
                              <p className="text-[10px] text-gray-400">{new Date(r.createdAt).toLocaleDateString("en-IN")}</p>
                            </div>
                            <div className="flex items-center gap-2">
                              {r.status === "REQUESTED" ? (
                                <>
                                  <Button size="sm" variant="outline" onClick={() => handleRequestAction(r.id, "APPROVED")}>
                                    <CheckCircle2 className="mr-1 h-3 w-3" /> Approve
                                  </Button>
                                  <Button size="sm" variant="ghost" onClick={() => handleRequestAction(r.id, "REJECTED")} className="text-red-500">
                                    <XCircle className="mr-1 h-3 w-3" /> Decline
                                  </Button>
                                </>
                              ) : (
                                <Badge variant={STATUS_BADGE[r.status]}>{r.status}</Badge>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                )}
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
