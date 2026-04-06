"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { IndianRupee, CheckCircle2, ArrowRight } from "lucide-react";
import { formatCurrency } from "@/lib/utils";

interface Props {
  startupId: string;
  startupName: string;
  currentStatus: string;
  grantAmount: number | null;
  grantDate: string | null;
  grantReference: string | null;
  grantSource: string | null;
}

const STATUS_COLORS: Record<string, string> = {
  INCUBATED: "bg-blue-100 text-blue-700",
  FUNDED: "bg-green-100 text-green-700",
  GRADUATED: "bg-violet-100 text-violet-700",
};

export function FundingGraduation({ startupId, startupName, currentStatus, grantAmount, grantDate, grantReference, grantSource }: Props) {
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState(currentStatus);
  const [savedGrant, setSavedGrant] = useState({ amount: grantAmount, date: grantDate, reference: grantReference, source: grantSource });

  async function handleGraduate(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSaving(true);
    const fd = new FormData(e.currentTarget);

    const res = await fetch("/api/startups/fund", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        startupId,
        fundingStatus: fd.get("fundingStatus"),
        grantAmount: fd.get("grantAmount"),
        grantDate: fd.get("grantDate"),
        grantReference: fd.get("grantReference"),
        grantSource: fd.get("grantSource"),
      }),
    });

    if (res.ok) {
      const data = await res.json();
      setStatus(data.fundingStatus);
      setSavedGrant({
        amount: data.grantAmount,
        date: data.grantDate,
        reference: data.grantReference,
        source: data.grantSource,
      });
      setShowForm(false);
    }
    setSaving(false);
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-2">
          <IndianRupee className="h-4 w-4" />
          Funding Status
        </CardTitle>
        <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${STATUS_COLORS[status] || STATUS_COLORS.INCUBATED}`}>
          {status}
        </span>
      </CardHeader>
      <CardContent>
        {/* Show existing grant details if funded */}
        {status !== "INCUBATED" && savedGrant.amount && (
          <div className="mb-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-xl bg-gray-50 p-3">
              <p className="text-[10px] text-gray-500">Grant Amount</p>
              <p className="text-sm font-bold text-gray-900">{formatCurrency(savedGrant.amount)}</p>
            </div>
            {savedGrant.date && (
              <div className="rounded-xl bg-gray-50 p-3">
                <p className="text-[10px] text-gray-500">Date</p>
                <p className="text-sm font-medium text-gray-900">{new Date(savedGrant.date).toLocaleDateString("en-IN")}</p>
              </div>
            )}
            {savedGrant.reference && (
              <div className="rounded-xl bg-gray-50 p-3">
                <p className="text-[10px] text-gray-500">Reference/Cheque</p>
                <p className="text-sm font-mono font-medium text-gray-900">{savedGrant.reference}</p>
              </div>
            )}
            {savedGrant.source && (
              <div className="rounded-xl bg-gray-50 p-3">
                <p className="text-[10px] text-gray-500">Source</p>
                <p className="text-sm font-medium text-gray-900">{savedGrant.source}</p>
              </div>
            )}
          </div>
        )}

        {/* Graduation action */}
        {!showForm ? (
          <Button size="sm" variant="outline" onClick={() => setShowForm(true)}>
            {status === "INCUBATED" ? (
              <><ArrowRight className="mr-2 h-3.5 w-3.5" /> Mark as Funded</>
            ) : (
              <><CheckCircle2 className="mr-2 h-3.5 w-3.5" /> Update Funding Details</>
            )}
          </Button>
        ) : (
          <form onSubmit={handleGraduate} className="space-y-3 rounded-xl border border-gray-200 p-4">
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="space-y-1">
                <label className="block text-sm font-medium text-gray-700">Status</label>
                <select name="fundingStatus" defaultValue={status === "INCUBATED" ? "FUNDED" : status} className="flex h-10 w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm">
                  <option value="INCUBATED">Incubated</option>
                  <option value="FUNDED">Funded</option>
                  <option value="GRADUATED">Graduated</option>
                </select>
              </div>
              <Input label="Grant Amount (INR)" name="grantAmount" type="number" defaultValue={savedGrant.amount || ""} placeholder="e.g. 500000" />
            </div>
            <div className="grid gap-3 sm:grid-cols-3">
              <Input label="Date" name="grantDate" type="date" defaultValue={savedGrant.date ? new Date(savedGrant.date).toISOString().split("T")[0] : ""} />
              <Input label="Cheque / Reference No." name="grantReference" defaultValue={savedGrant.reference || ""} placeholder="CHQ-12345" />
              <Input label="Source" name="grantSource" defaultValue={savedGrant.source || ""} placeholder="e.g. RKVY, AIM Seed Fund" />
            </div>
            <div className="flex gap-2">
              <Button type="submit" size="sm" disabled={saving}>{saving ? "Saving..." : "Save"}</Button>
              <Button type="button" size="sm" variant="ghost" onClick={() => setShowForm(false)}>Cancel</Button>
            </div>
          </form>
        )}
      </CardContent>
    </Card>
  );
}
