"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  FileText, Target, Send, AlertTriangle, CheckCircle2,
  Clock, ArrowRight,
} from "lucide-react";
import Link from "next/link";

interface Task {
  type: string;
  title: string;
  description: string;
  deadline?: string;
  link: string;
  priority: "high" | "medium" | "low";
}

const TYPE_ICONS: Record<string, typeof FileText> = {
  report: FileText,
  data_request: Send,
  milestone: Target,
};

const PRIORITY_COLORS: Record<string, string> = {
  high: "border-red-200 bg-red-50/50",
  medium: "border-yellow-200 bg-yellow-50/50",
  low: "",
};

export default function TasksPage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/startup/dashboard")
      .then((res) => res.json())
      .then((data) => {
        setTasks(data.tasks || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const high = tasks.filter((t) => t.priority === "high");
  const medium = tasks.filter((t) => t.priority === "medium");
  const low = tasks.filter((t) => t.priority === "low");

  if (loading) return <div className="flex h-64 items-center justify-center"><p className="text-gray-500">Loading tasks...</p></div>;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Tasks</h1>
        <p className="text-sm text-gray-500">
          Everything you need to do — reports, data requests, milestones
        </p>
      </div>

      {tasks.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <CheckCircle2 className="mx-auto h-12 w-12 text-green-400" />
            <h3 className="mt-4 text-lg font-medium text-gray-900">All caught up!</h3>
            <p className="mt-2 text-sm text-gray-500">No pending tasks right now.</p>
          </CardContent>
        </Card>
      ) : (
        <>
          {/* Urgent */}
          {high.length > 0 && (
            <div>
              <h2 className="text-sm font-semibold text-red-600 uppercase tracking-wider mb-2 flex items-center gap-1">
                <AlertTriangle className="h-3.5 w-3.5" /> Urgent ({high.length})
              </h2>
              <div className="space-y-2">
                {high.map((t, i) => <TaskCard key={i} task={t} />)}
              </div>
            </div>
          )}

          {/* Due Soon */}
          {medium.length > 0 && (
            <div>
              <h2 className="text-sm font-semibold text-yellow-600 uppercase tracking-wider mb-2 flex items-center gap-1">
                <Clock className="h-3.5 w-3.5" /> Due Soon ({medium.length})
              </h2>
              <div className="space-y-2">
                {medium.map((t, i) => <TaskCard key={i} task={t} />)}
              </div>
            </div>
          )}

          {/* Upcoming */}
          {low.length > 0 && (
            <div>
              <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-2">
                Upcoming ({low.length})
              </h2>
              <div className="space-y-2">
                {low.map((t, i) => <TaskCard key={i} task={t} />)}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}

function TaskCard({ task }: { task: Task }) {
  const Icon = TYPE_ICONS[task.type] || FileText;
  return (
    <Link href={task.link}>
      <Card className={`cursor-pointer transition-all hover:shadow-md ${PRIORITY_COLORS[task.priority]}`}>
        <CardContent className="flex items-center justify-between p-4">
          <div className="flex items-center gap-3">
            <div className={`flex h-9 w-9 items-center justify-center rounded-lg ${
              task.priority === "high" ? "bg-red-100" : task.priority === "medium" ? "bg-yellow-100" : "bg-gray-100"
            }`}>
              <Icon className={`h-4 w-4 ${
                task.priority === "high" ? "text-red-600" : task.priority === "medium" ? "text-yellow-600" : "text-gray-500"
              }`} />
            </div>
            <div>
              <p className="text-sm font-medium">{task.title}</p>
              <p className="text-xs text-gray-500">{task.description}</p>
              {task.deadline && (
                <p className="text-xs text-gray-400 mt-0.5">
                  Due: {new Date(task.deadline).toLocaleDateString("en-IN")}
                </p>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant={task.type === "report" ? "default" : task.type === "data_request" ? "secondary" : "outline"}>
              {task.type.replace(/_/g, " ")}
            </Badge>
            <ArrowRight className="h-4 w-4 text-gray-400" />
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
