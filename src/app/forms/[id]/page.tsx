"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, Zap } from "lucide-react";
import Link from "next/link";

interface FieldDef { name: string; label: string; type: string; required: boolean; options?: string[]; placeholder?: string; }
interface FormData { id: string; title: string; description: string | null; type: string; fields: FieldDef[]; isActive: boolean; deadline: string | null; organization: { name: string; logo: string | null }; }

export default function PublicFormPage() {
  const { id } = useParams<{ id: string }>();
  const [form, setForm] = useState<FormData | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    fetch(`/api/forms/${id}`).then(r => r.json()).then(d => { if (!d.error) setForm(d); setLoading(false); }).catch(() => setLoading(false));
  }, [id]);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSubmitting(true);
    const fd = new FormData(e.currentTarget);
    const data: Record<string, unknown> = {};
    form?.fields.forEach(f => {
      const val = fd.get(f.name);
      data[f.name] = f.type === "number" ? Number(val) : val;
    });

    await fetch(`/api/forms/${id}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        data,
        respondentName: fd.get("_respondentName"),
        respondentEmail: fd.get("_respondentEmail"),
        respondentPhone: fd.get("_respondentPhone"),
      }),
    });
    setSubmitted(true);
    setSubmitting(false);
  }

  if (loading) return <div className="flex min-h-screen items-center justify-center bg-[#f5f5f0]"><p className="text-gray-500">Loading...</p></div>;
  if (!form) return <div className="flex min-h-screen items-center justify-center bg-[#f5f5f0]"><p className="text-gray-500">Form not found</p></div>;

  if (submitted) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#f5f5f0] px-4">
        <Card className="w-full max-w-lg">
          <CardContent className="py-12 text-center">
            <CheckCircle2 className="mx-auto h-12 w-12 text-green-500" />
            <h2 className="mt-4 text-xl font-bold text-gray-900">Thank you!</h2>
            <p className="mt-2 text-sm text-gray-500">Your response has been submitted successfully.</p>
            <Link href="/" className="mt-4 inline-block text-sm text-blue-600 hover:underline">Go to Incubest</Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f5f5f0] py-12 px-4">
      <div className="mx-auto max-w-2xl">
        {/* Header */}
        <div className="mb-8 text-center">
          <Link href="/" className="inline-flex items-center gap-2 mb-4">
            {form.organization.logo ? (
              <img src={form.organization.logo} alt="" className="h-8 w-8 rounded-lg" />
            ) : (
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gray-900"><Zap className="h-5 w-5 text-white" /></div>
            )}
            <span className="text-sm font-medium text-gray-600">{form.organization.name}</span>
          </Link>
          <h1 className="text-2xl font-bold text-gray-900">{form.title}</h1>
          {form.description && <p className="mt-2 text-sm text-gray-500">{form.description}</p>}
          <div className="mt-3 flex items-center justify-center gap-2">
            <Badge variant="secondary">{form.type.replace(/_/g, " ")}</Badge>
            {form.deadline && <Badge variant="outline">Due: {new Date(form.deadline).toLocaleDateString("en-IN")}</Badge>}
          </div>
        </div>

        {/* Form */}
        <Card>
          <CardContent className="p-6">
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Contact info for guests */}
              {form.type === "CALL_FOR_ENTRIES" && (
                <div className="space-y-3 border-b border-gray-200 pb-4 mb-4">
                  <p className="text-sm font-medium text-gray-700">Your Details</p>
                  <div className="grid gap-3 sm:grid-cols-2">
                    <Input label="Full Name *" name="_respondentName" required />
                    <Input label="Email *" name="_respondentEmail" type="email" required />
                  </div>
                  <Input label="Phone" name="_respondentPhone" placeholder="+91..." />
                </div>
              )}

              {/* Dynamic fields */}
              {form.fields.map((field) => (
                <div key={field.name}>
                  {/* Paragraph / Textarea */}
                  {(field.type === "textarea" || field.type === "paragraph") ? (
                    <div>
                      <label className="mb-1 block text-sm font-medium text-gray-700">{field.label}{field.required ? " *" : ""}</label>
                      <textarea name={field.name} required={field.required} rows={3} placeholder={field.placeholder} className="flex w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-900/10" />
                    </div>
                  ) : (field.type === "select" || field.type === "dropdown") && field.options ? (
                    <div>
                      <label className="mb-1 block text-sm font-medium text-gray-700">{field.label}{field.required ? " *" : ""}</label>
                      <select name={field.name} required={field.required} className="flex h-10 w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900">
                        <option value="">Select...</option>
                        {field.options.map(o => <option key={o} value={o}>{o}</option>)}
                      </select>
                    </div>
                  ) : field.type === "single_choice" && field.options ? (
                    <div>
                      <label className="mb-2 block text-sm font-medium text-gray-700">{field.label}{field.required ? " *" : ""}</label>
                      <div className="space-y-2">
                        {field.options.map(o => (
                          <label key={o} className="flex items-center gap-2 text-sm text-gray-700">
                            <input type="radio" name={field.name} value={o} required={field.required} className="text-gray-900" /> {o}
                          </label>
                        ))}
                      </div>
                    </div>
                  ) : field.type === "multiple_choice" && field.options ? (
                    <div>
                      <label className="mb-2 block text-sm font-medium text-gray-700">{field.label}{field.required ? " *" : ""}</label>
                      <div className="space-y-2">
                        {field.options.map(o => (
                          <label key={o} className="flex items-center gap-2 text-sm text-gray-700">
                            <input type="checkbox" name={field.name} value={o} className="rounded border-gray-300" /> {o}
                          </label>
                        ))}
                      </div>
                    </div>
                  ) : field.type === "rating" ? (
                    <div>
                      <label className="mb-2 block text-sm font-medium text-gray-700">{field.label}{field.required ? " *" : ""}</label>
                      <div className="flex gap-1">
                        {[1,2,3,4,5].map(n => (
                          <label key={n} className="cursor-pointer">
                            <input type="radio" name={field.name} value={n} className="sr-only peer" required={field.required} />
                            <span className="text-2xl text-gray-300 peer-checked:text-yellow-400 hover:text-yellow-300 transition-colors">★</span>
                          </label>
                        ))}
                      </div>
                    </div>
                  ) : field.type === "file_upload" ? (
                    <div>
                      <label className="mb-1 block text-sm font-medium text-gray-700">{field.label}{field.required ? " *" : ""}</label>
                      <input type="file" name={field.name} required={field.required} className="block w-full text-sm text-gray-500 file:mr-4 file:rounded-lg file:border-0 file:bg-gray-100 file:px-4 file:py-2 file:text-sm file:font-medium" />
                    </div>
                  ) : field.type === "checkbox" ? (
                    <label className="flex items-center gap-2 text-sm text-gray-700">
                      <input type="checkbox" name={field.name} className="rounded border-gray-300" />
                      {field.label}
                    </label>
                  ) : (
                    <Input label={`${field.label}${field.required ? " *" : ""}`} name={field.name}
                      type={field.type === "number" ? "number" : field.type === "date" ? "date" : field.type === "email" ? "email" : field.type === "url" ? "url" : field.type === "phone" ? "tel" : "text"}
                      required={field.required} placeholder={field.placeholder} />
                  )}
                </div>
              ))}

              <Button type="submit" disabled={submitting} className="w-full">
                {submitting ? "Submitting..." : "Submit"}
              </Button>
            </form>
          </CardContent>
        </Card>

        <p className="mt-6 text-center text-xs text-gray-400">Powered by <Link href="/" className="text-blue-600 hover:underline">Incubest</Link></p>
      </div>
    </div>
  );
}
