"use client";

import { useState } from "react";
import { FileText, Send, Target } from "lucide-react";

// Re-use existing pages as components by lazy importing
import ReportsPage from "../reports/page";
import DataRequestsPage from "../data-requests/page";
import MilestonesPage from "../milestones/page";

const TABS = [
  { id: "reports", label: "Monthly Reports", icon: FileText },
  { id: "data-requests", label: "Data Requests", icon: Send },
  { id: "milestones", label: "Milestones", icon: Target },
] as const;

type TabId = (typeof TABS)[number]["id"];

export default function ReportingPage() {
  const [activeTab, setActiveTab] = useState<TabId>("reports");

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Reporting</h1>
        <p className="text-sm text-gray-500">Monthly reports, data requests, and milestones</p>
      </div>

      <div className="flex gap-1 overflow-x-auto rounded-lg bg-gray-100 p-1">
        {TABS.map((tab) => (
          <button key={tab.id} onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 whitespace-nowrap rounded-md px-4 py-2 text-sm font-medium transition-colors ${activeTab === tab.id ? "bg-white text-gray-900 shadow-sm" : "text-gray-600"}`}>
            <tab.icon className="h-4 w-4" />{tab.label}
          </button>
        ))}
      </div>

      {activeTab === "reports" && <ReportsPage />}
      {activeTab === "data-requests" && <DataRequestsPage />}
      {activeTab === "milestones" && <MilestonesPage />}
    </div>
  );
}
