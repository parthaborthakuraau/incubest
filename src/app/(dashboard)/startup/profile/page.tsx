"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  User, Building2, FileText, Shield, Save, CheckCircle2,
} from "lucide-react";

const SECTORS = [
  "AGRITECH", "EDTECH", "FINTECH", "HEALTHTECH", "FOODTECH",
  "CLEANTECH", "DEEPTECH", "SAAS", "ECOMMERCE", "LOGISTICS",
  "SOCIAL_IMPACT", "MANUFACTURING", "AI_ML", "IOT", "BIOTECH", "OTHER",
];
const STAGES = ["IDEATION", "VALIDATION", "EARLY_TRACTION", "SCALING", "GROWTH"];

export default function ProfilePage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [step, setStep] = useState(1);

  const [userName, setUserName] = useState("");
  const [userPhoto, setUserPhoto] = useState("");
  const [userDin, setUserDin] = useState("");

  const [startupName, setStartupName] = useState("");
  const [description, setDescription] = useState("");
  const [sector, setSector] = useState("OTHER");
  const [stage, setStage] = useState("IDEATION");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [website, setWebsite] = useState("");
  const [logo, setLogo] = useState("");

  const [dpiitNumber, setDpiitNumber] = useState("");
  const [cinNumber, setCinNumber] = useState("");
  const [panNumber, setPanNumber] = useState("");
  const [gstNumber, setGstNumber] = useState("");

  const [founderGender, setFounderGender] = useState("");
  const [founderCategory, setFounderCategory] = useState("");
  const [isWomenLed, setIsWomenLed] = useState(false);
  const [isRural, setIsRural] = useState(false);

  useEffect(() => {
    fetch("/api/startup/dashboard")
      .then((res) => res.json())
      .then((data) => {
        if (data.user) {
          setUserName(data.user.name || "");
          setUserPhoto(data.user.photo || "");
          setUserDin(data.user.dinNumber || "");
        }
        if (data.activeStartup) {
          const s = data.activeStartup;
          setStartupName(s.name || ""); setDescription(s.description || "");
          setSector(s.sector || "OTHER"); setStage(s.stage || "IDEATION");
          setCity(s.city || ""); setState(s.state || "");
          setWebsite(s.website || ""); setLogo(s.logo || "");
          setDpiitNumber(s.dpiitNumber || ""); setCinNumber(s.cinNumber || "");
          setPanNumber(s.panNumber || ""); setGstNumber(s.gstNumber || "");
          setFounderGender(s.founderGender || ""); setFounderCategory(s.founderCategory || "");
          setIsWomenLed(s.isWomenLed || false); setIsRural(s.isRural || false);
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  async function handleSave() {
    setSaving(true); setSaved(false);
    await fetch("/api/settings", {
      method: "PATCH", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ section: "profile", name: userName }),
    });
    await fetch("/api/startups", {
      method: "PATCH", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: startupName, description, sector, stage, city, state, website, logo,
        dpiitNumber, cinNumber, panNumber, gstNumber,
        founderGender, founderCategory, isWomenLed, isRural,
        dpiitRecognized: !!dpiitNumber,
      }),
    });
    setSaving(false); setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  }

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>, type: "founder" | "logo") {
    const file = e.target.files?.[0];
    if (!file) return;
    const fd = new FormData(); fd.append("file", file);
    const res = await fetch("/api/upload", { method: "POST", body: fd });
    if (res.ok) {
      const { url } = await res.json();
      if (type === "founder") {
        setUserPhoto(url);
        await fetch("/api/settings", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ section: "profile", photo: url }) });
      } else {
        setLogo(url);
        // Save logo immediately to startup
        await fetch("/api/startups", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ logo: url }) });
      }
    }
  }

  const progress = [!!startupName, !!description, sector !== "OTHER", !!userName, !!(dpiitNumber || panNumber || cinNumber), !!logo, !!userPhoto].filter(Boolean).length;

  if (loading) return <div className="flex h-64 items-center justify-center"><p className="text-gray-500">Loading...</p></div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <User className="h-6 w-6 text-brand-600" /> Profile
          </h1>
          <p className="text-sm text-gray-500">Complete your profile to unlock your Startup Passport</p>
        </div>
        <div className="flex items-center gap-3">
          {saved && <span className="text-sm text-green-600 flex items-center gap-1"><CheckCircle2 className="h-4 w-4" /> Saved</span>}
          <Button onClick={handleSave} disabled={saving}><Save className="mr-2 h-4 w-4" /> {saving ? "Saving..." : "Save All"}</Button>
        </div>
      </div>

      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm font-medium text-gray-900">Passport Completion</p>
            <div className="flex items-center gap-3">
              <p className="text-sm text-gray-500">{progress}/7</p>
              {!!(startupName && userName && (dpiitNumber || panNumber || cinNumber)) && (
                <a href="/startup/passport" className="inline-flex items-center gap-1.5 rounded-xl bg-gray-900 px-3 py-1.5 text-xs font-semibold text-white hover:bg-gray-800 transition-all">
                  <Shield className="h-3 w-3" /> View Passport
                </a>
              )}
            </div>
          </div>
          <div className="h-3 overflow-hidden rounded-full bg-gray-200">
            <div className="h-full rounded-full bg-gray-900 transition-all" style={{ width: `${(progress / 7) * 100}%` }} />
          </div>
        </CardContent>
      </Card>

      <div className="flex gap-1 overflow-x-auto rounded-lg bg-gray-100 p-1">
        {[
          { n: 1, label: "Basic Info", icon: Building2 },
          { n: 2, label: "Registration", icon: FileText },
          { n: 3, label: "Founders & Branding", icon: User },
          { n: 4, label: "Diversity", icon: Shield },
        ].map((s) => (
          <button key={s.n} onClick={() => setStep(s.n)} className={`flex items-center gap-2 whitespace-nowrap rounded-md px-4 py-2 text-sm font-medium transition-colors ${step === s.n ? "bg-white text-gray-900 shadow-sm" : "text-gray-600"}`}>
            <s.icon className="h-4 w-4" />{s.label}
          </button>
        ))}
      </div>

      {step === 1 && (
        <Card><CardHeader><CardTitle>Basic Information</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <Input label="Startup Name *" value={startupName} onChange={(e) => setStartupName(e.target.value)} />
            <div><label className="mb-1 block text-sm font-medium text-gray-700">Description</label>
              <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={3} className="flex w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500" placeholder="What does your startup do?" /></div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1"><label className="block text-sm font-medium text-gray-700">Sector *</label>
                <select value={sector} onChange={(e) => setSector(e.target.value)} className="flex h-10 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm">{SECTORS.map((s) => <option key={s} value={s}>{s.replace(/_/g, " ")}</option>)}</select></div>
              <div className="space-y-1"><label className="block text-sm font-medium text-gray-700">Stage</label>
                <select value={stage} onChange={(e) => setStage(e.target.value)} className="flex h-10 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm">{STAGES.map((s) => <option key={s} value={s}>{s.replace(/_/g, " ")}</option>)}</select></div>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <Input label="City" value={city} onChange={(e) => setCity(e.target.value)} />
              <Input label="State" value={state} onChange={(e) => setState(e.target.value)} />
            </div>
            <Input label="Website" value={website} onChange={(e) => setWebsite(e.target.value)} placeholder="https://" />
          </CardContent></Card>
      )}

      {step === 2 && (
        <Card><CardHeader><CardTitle>Registration Details</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-gray-500">At least one of DPIIT, PAN, or CIN is required for your passport.</p>
            <div className="grid gap-4 sm:grid-cols-2">
              <Input label="DPIIT Number" value={dpiitNumber} onChange={(e) => setDpiitNumber(e.target.value)} placeholder="DIPP12345" />
              <Input label="CIN" value={cinNumber} onChange={(e) => setCinNumber(e.target.value)} placeholder="U72XXX..." />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <Input label="PAN" value={panNumber} onChange={(e) => setPanNumber(e.target.value)} placeholder="AAAAA1234A" />
              <Input label="GST" value={gstNumber} onChange={(e) => setGstNumber(e.target.value)} />
            </div>
          </CardContent></Card>
      )}

      {step === 3 && (
        <Card><CardHeader><CardTitle>Founders & Branding</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <Input label="Founder Name *" value={userName} onChange={(e) => setUserName(e.target.value)} />
            <Input label="DIN (Director Identification Number)" value={userDin} onChange={(e) => setUserDin(e.target.value)} placeholder="09876543" />
            <div><label className="mb-1 block text-sm font-medium text-gray-700">Founder Photo</label>
              {userPhoto && <img src={userPhoto} alt="Founder" className="mb-2 h-20 w-20 rounded-lg object-cover border" />}
              <input type="file" accept="image/*" onChange={(e) => handleUpload(e, "founder")} className="block w-full text-sm text-gray-500 file:mr-4 file:rounded-lg file:border-0 file:bg-brand-50 file:px-4 file:py-2 file:text-sm file:font-medium file:text-brand-700" /></div>
            <div><label className="mb-1 block text-sm font-medium text-gray-700">Startup Logo</label>
              {logo && <img src={logo} alt="Logo" className="mb-2 h-20 w-20 rounded-lg object-cover border" />}
              <input type="file" accept="image/*" onChange={(e) => handleUpload(e, "logo")} className="block w-full text-sm text-gray-500 file:mr-4 file:rounded-lg file:border-0 file:bg-brand-50 file:px-4 file:py-2 file:text-sm file:font-medium file:text-brand-700" /></div>
          </CardContent></Card>
      )}

      {step === 4 && (
        <Card><CardHeader><CardTitle>Diversity & Inclusion</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1"><label className="block text-sm font-medium text-gray-700">Founder Gender</label>
                <select value={founderGender} onChange={(e) => setFounderGender(e.target.value)} className="flex h-10 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm">
                  <option value="">Select</option><option value="male">Male</option><option value="female">Female</option><option value="transgender">Transgender</option><option value="other">Other</option>
                </select></div>
              <div className="space-y-1"><label className="block text-sm font-medium text-gray-700">Category</label>
                <select value={founderCategory} onChange={(e) => setFounderCategory(e.target.value)} className="flex h-10 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm">
                  <option value="">Select</option><option value="general">General</option><option value="sc">SC</option><option value="st">ST</option><option value="obc">OBC</option><option value="ews">EWS</option><option value="minority">Minority</option>
                </select></div>
            </div>
            <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={isWomenLed} onChange={(e) => setIsWomenLed(e.target.checked)} className="rounded border-gray-300" /> Women-Led Startup</label>
            <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={isRural} onChange={(e) => setIsRural(e.target.checked)} className="rounded border-gray-300" /> Rural Area Startup</label>
          </CardContent></Card>
      )}
    </div>
  );
}
