"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  FolderOpen,
  Upload,
  FileText,
  Trash2,
  ExternalLink,
  X,
  Plus,
} from "lucide-react";

interface Document {
  id: string;
  name: string;
  type: string;
  url: string;
  size: number | null;
  createdAt: string;
}

const documentTypes = [
  { value: "pitch_deck", label: "Pitch Deck" },
  { value: "incorporation_cert", label: "Incorporation Certificate" },
  { value: "dpiit_cert", label: "DPIIT Certificate" },
  { value: "gst_cert", label: "GST Certificate" },
  { value: "patent", label: "Patent" },
  { value: "financial_statement", label: "Financial Statement" },
  { value: "mou", label: "MoU / Agreement" },
  { value: "product_doc", label: "Product Documentation" },
  { value: "other", label: "Other" },
];

function formatFileSize(bytes: number | null): string {
  if (!bytes) return "—";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export default function StartupDocumentsPage() {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [uploadMode, setUploadMode] = useState<"file" | "url">("file");
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    fetchDocuments();
  }, []);

  async function fetchDocuments() {
    const res = await fetch("/api/documents");
    if (res.ok) {
      const data = await res.json();
      setDocuments(data);
    }
    setLoading(false);
  }

  async function handleAdd(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSubmitting(true);

    const formData = new FormData(e.currentTarget);
    let url = formData.get("url") as string;
    let size: number | null = null;

    // If file mode, upload first
    if (uploadMode === "file") {
      const fileInput = (e.currentTarget.querySelector('input[name="file"]') as HTMLInputElement);
      const file = fileInput?.files?.[0];
      if (!file) {
        setSubmitting(false);
        return;
      }
      setUploading(true);
      const uploadData = new FormData();
      uploadData.append("file", file);
      const uploadRes = await fetch("/api/upload", {
        method: "POST",
        body: uploadData,
      });
      if (!uploadRes.ok) {
        alert("File upload failed");
        setSubmitting(false);
        setUploading(false);
        return;
      }
      const uploaded = await uploadRes.json();
      url = uploaded.url;
      size = uploaded.size;
      setUploading(false);
    }

    const body = {
      name: formData.get("name"),
      type: formData.get("type"),
      url,
      size,
    };

    const res = await fetch("/api/documents", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    if (res.ok) {
      setShowForm(false);
      fetchDocuments();
    }
    setSubmitting(false);
  }

  async function handleDelete(id: string) {
    setDeleting(id);
    const res = await fetch(`/api/documents?id=${id}`, { method: "DELETE" });
    if (res.ok) {
      fetchDocuments();
    }
    setDeleting(null);
  }

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <p className="text-gray-500">Loading documents...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Documents</h1>
          <p className="text-sm text-gray-500">
            Store and manage your startup documents
          </p>
        </div>
        <Button onClick={() => setShowForm(!showForm)}>
          {showForm ? (
            <><X className="mr-2 h-4 w-4" /> Cancel</>
          ) : (
            <><Plus className="mr-2 h-4 w-4" /> Add Document</>
          )}
        </Button>
      </div>

      {showForm && (
        <Card>
          <CardHeader>
            <CardTitle>Add Document</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleAdd} className="space-y-4">
              <Input
                label="Document Name"
                name="name"
                placeholder="e.g. Q4 Pitch Deck"
                required
              />
              <div className="space-y-1">
                <label className="block text-sm font-medium text-gray-700">
                  Document Type
                </label>
                <select
                  name="type"
                  required
                  className="flex h-10 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                >
                  {documentTypes.map((t) => (
                    <option key={t.value} value={t.value}>
                      {t.label}
                    </option>
                  ))}
                </select>
              </div>
              {/* Upload mode toggle */}
              <div className="flex gap-2 rounded-lg bg-gray-100 p-1">
                <button
                  type="button"
                  onClick={() => setUploadMode("file")}
                  className={`rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
                    uploadMode === "file"
                      ? "bg-white text-gray-900 shadow-sm"
                      : "text-gray-600 hover:text-gray-900"
                  }`}
                >
                  <Upload className="mr-1.5 inline h-3.5 w-3.5" />
                  Upload File
                </button>
                <button
                  type="button"
                  onClick={() => setUploadMode("url")}
                  className={`rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
                    uploadMode === "url"
                      ? "bg-white text-gray-900 shadow-sm"
                      : "text-gray-600 hover:text-gray-900"
                  }`}
                >
                  <ExternalLink className="mr-1.5 inline h-3.5 w-3.5" />
                  Paste URL
                </button>
              </div>

              {uploadMode === "file" ? (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    File (max 10MB)
                  </label>
                  <input
                    name="file"
                    type="file"
                    required
                    className="block w-full text-sm text-gray-500 file:mr-4 file:rounded-lg file:border-0 file:bg-brand-50 file:px-4 file:py-2 file:text-sm file:font-medium file:text-brand-700 hover:file:bg-brand-100"
                  />
                </div>
              ) : (
                <>
                  <Input
                    label="Document URL"
                    name="url"
                    type="url"
                    placeholder="https://drive.google.com/... or any file link"
                    required
                  />
                  <p className="text-xs text-gray-400">
                    Paste a link from Google Drive, Dropbox, or any cloud storage.
                  </p>
                </>
              )}
              <Button type="submit" disabled={submitting}>
                <Upload className="mr-2 h-4 w-4" />
                {uploading ? "Uploading..." : submitting ? "Adding..." : "Add Document"}
              </Button>
            </form>
          </CardContent>
        </Card>
      )}

      {documents.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <FolderOpen className="mx-auto h-12 w-12 text-gray-300" />
            <h3 className="mt-4 text-lg font-medium text-gray-900">
              No documents yet
            </h3>
            <p className="mt-2 text-sm text-gray-500">
              Add your pitch deck, certificates, and other important documents.
            </p>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>
              All Documents
              <Badge variant="secondary" className="ml-2">
                {documents.length}
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {documents.map((doc) => (
                <div
                  key={doc.id}
                  className="flex items-center justify-between rounded-lg border border-gray-100 p-3"
                >
                  <div className="flex items-center gap-3">
                    <FileText className="h-5 w-5 text-gray-400" />
                    <div>
                      <p className="text-sm font-medium">{doc.name}</p>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline">
                          {documentTypes.find((t) => t.value === doc.type)?.label || doc.type}
                        </Badge>
                        <span className="text-xs text-gray-400">
                          {formatFileSize(doc.size)}
                        </span>
                        <span className="text-xs text-gray-400">
                          {new Date(doc.createdAt).toLocaleDateString("en-IN")}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <a
                      href={doc.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex h-8 w-8 items-center justify-center rounded-md hover:bg-gray-100"
                    >
                      <ExternalLink className="h-4 w-4 text-gray-500" />
                    </a>
                    <button
                      onClick={() => handleDelete(doc.id)}
                      disabled={deleting === doc.id}
                      className="inline-flex h-8 w-8 items-center justify-center rounded-md hover:bg-red-50"
                    >
                      <Trash2 className="h-4 w-4 text-red-500" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
