"use client";

import { useState, useRef, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { Send, Loader2, BarChart3, FileText, AlertTriangle, DollarSign, Trash2, X, MessageSquare, Copy, Check } from "lucide-react";

interface Message {
  role: "user" | "assistant";
  content: string;
}

interface ChatHistory {
  id: string;
  preview: string;
  date: string;
  messages: Message[];
}

function renderMarkdown(text: string): string {
  return text
    // Escape HTML
    .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
    // Bold **text**
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    // Italic *text*
    .replace(/\*(.+?)\*/g, '<em>$1</em>')
    // Headers ### / ## / #
    .replace(/^### (.+)$/gm, '<p class="font-semibold text-gray-900 mt-2">$1</p>')
    .replace(/^## (.+)$/gm, '<p class="font-bold text-gray-900 mt-3">$1</p>')
    .replace(/^# (.+)$/gm, '<p class="text-lg font-bold text-gray-900 mt-3">$1</p>')
    // Bullet lists
    .replace(/^\* (.+)$/gm, '<span class="block pl-3">• $1</span>')
    .replace(/^- (.+)$/gm, '<span class="block pl-3">• $1</span>')
    // Line breaks
    .replace(/\n/g, '<br/>');
}

export default function ChatPage() {
  const searchParams = useSearchParams();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [showHistory, setShowHistory] = useState(true);
  const [chatHistory, setChatHistory] = useState<ChatHistory[]>([]);
  const [activeChatId, setActiveChatId] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // Reset on ?new=1 query param (from +Chat button)
  useEffect(() => {
    if (searchParams.get("new") === "1") {
      if (messages.length > 0) saveToHistory(messages);
      setMessages([]);
      setActiveChatId(null);
    }
  }, [searchParams]);

  // Load chat history from localStorage
  useEffect(() => {
    const saved = localStorage.getItem("incubest-chat-history");
    if (saved) {
      try {
        const parsed = JSON.parse(saved) as ChatHistory[];
        // Filter to last 30 days
        const cutoff = Date.now() - 30 * 24 * 60 * 60 * 1000;
        setChatHistory(parsed.filter((c) => new Date(c.date).getTime() > cutoff));
      } catch { /* ignore */ }
    }
  }, []);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  function saveToHistory(msgs: Message[]) {
    if (msgs.length === 0) return;
    const id = activeChatId || `chat-${Date.now()}`;
    const preview = msgs[0].content.slice(0, 60);
    const updated = [
      { id, preview, date: new Date().toISOString(), messages: msgs },
      ...chatHistory.filter((c) => c.id !== id),
    ].slice(0, 50); // Keep max 50
    setChatHistory(updated);
    setActiveChatId(id);
    localStorage.setItem("incubest-chat-history", JSON.stringify(updated));
  }

  function loadChat(chat: ChatHistory) {
    setMessages(chat.messages);
    setActiveChatId(chat.id);
  }

  function newChat() {
    // Save current if it has messages
    if (messages.length > 0) saveToHistory(messages);
    setMessages([]);
    setActiveChatId(null);
    setShowHistory(true);
  }

  function clearHistory() {
    setChatHistory([]);
    localStorage.removeItem("incubest-chat-history");
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const userMessage = input.trim();
    setInput("");
    const newMsgs = [...messages, { role: "user" as const, content: userMessage }];
    setMessages(newMsgs);
    setLoading(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: userMessage, history: messages }),
      });

      if (res.ok) {
        const data = await res.json();
        const finalMsgs = [...newMsgs, { role: "assistant" as const, content: data.response }];
        setMessages(finalMsgs);
        saveToHistory(finalMsgs);
      } else {
        const finalMsgs = [...newMsgs, { role: "assistant" as const, content: "Sorry, I encountered an error. Please try again." }];
        setMessages(finalMsgs);
      }
    } catch {
      setMessages([...newMsgs, { role: "assistant" as const, content: "Failed to connect. Please check your connection." }]);
    }

    setLoading(false);
    inputRef.current?.focus();
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  }

  // Detect user role for suggestions
  const [userRole, setUserRole] = useState<string>("");
  useEffect(() => {
    fetch("/api/settings").then(r => r.json()).then(d => {
      setUserRole(d.user?.role || "");
    }).catch(() => {});
  }, []);

  const isStartupUser = userRole === "STARTUP_FOUNDER";

  const suggestions = isStartupUser ? [
    { text: "How can I improve my product-market fit?", icon: BarChart3 },
    { text: "What funding options are available for my stage?", icon: DollarSign },
    { text: "Help me prepare for my next monthly report", icon: FileText },
    { text: "What are common mistakes early-stage startups make?", icon: AlertTriangle },
  ] : [
    { text: "How many startups haven't reported this month?", icon: BarChart3 },
    { text: "Generate a summary report for AIM grantor", icon: FileText },
    { text: "Which startups are at risk?", icon: AlertTriangle },
    { text: "Show me total revenue across programs", icon: DollarSign },
  ];

  function formatDate(d: string) {
    const date = new Date(d);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    if (diff < 86400000) return "Today";
    if (diff < 172800000) return "Yesterday";
    if (diff < 604800000) return `${Math.floor(diff / 86400000)}d ago`;
    return date.toLocaleDateString("en-IN", { day: "numeric", month: "short" });
  }

  return (
    <div className="flex -m-4 md:-m-6 lg:-m-8 h-[calc(100vh-3.5rem)]">
      {/* Main chat area */}
      <div className="flex flex-1 flex-col min-w-0 h-full">
        {/* Messages — scrollable area */}
        <div className="flex-1 overflow-y-auto min-h-0">
          {messages.length === 0 ? (
            <div className="flex h-full flex-col items-center justify-center px-4">
              <div className="max-w-2xl w-full text-center">
                <h1 className="text-4xl md:text-5xl font-bold">
                  <span className="text-gray-900">Hi there, </span>
                  <span className="text-gray-400">welcome</span>
                </h1>
                <h2 className="mt-1 text-4xl md:text-5xl font-bold">
                  <span className="text-gray-400">What would </span>
                  <span className="text-gray-900">like to know?</span>
                </h2>
                <p className="mt-4 text-sm text-gray-500">
                  Use one of the most common prompts below or use your own to begin
                </p>

                <div className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-3">
                  {suggestions.map((s) => (
                    <button
                      key={s.text}
                      onClick={() => setInput(s.text)}
                      className="group flex flex-col justify-between rounded-2xl border border-gray-200/80 bg-white p-4 text-left transition-all hover:shadow-md hover:border-gray-300 min-h-[120px]"
                    >
                      <p className="text-xs text-gray-700 leading-relaxed">{s.text}</p>
                      <s.icon className="mt-3 h-4 w-4 text-gray-300 group-hover:text-gray-500 transition-colors" />
                    </button>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="mx-auto max-w-3xl space-y-6 py-8 px-4">
              {messages.map((msg, i) => (
                <div key={i} className={`flex gap-3 ${msg.role === "user" ? "" : "flex-row-reverse"}`}>
                  <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${msg.role === "user" ? "bg-gray-900" : "bg-gray-200"}`}>
                    {msg.role === "user" ? (
                      <span className="text-xs font-bold text-white">Y</span>
                    ) : (
                      <img src="/dark.svg" alt="" className="h-4 w-4" />
                    )}
                  </div>
                  <div className={`group/msg relative max-w-[75%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${msg.role === "user" ? "bg-gray-900 text-white" : "bg-white text-gray-800 border border-gray-200/80"}`}>
                    <div className="whitespace-pre-wrap select-text prose-sm" dangerouslySetInnerHTML={{ __html: renderMarkdown(msg.content) }} />
                    <button
                      onClick={() => { navigator.clipboard.writeText(msg.content); }}
                      className="absolute -bottom-3 right-2 hidden group-hover/msg:flex h-6 w-6 items-center justify-center rounded-lg bg-gray-100 text-gray-500 hover:text-gray-700 shadow-sm transition-all"
                      title="Copy"
                    >
                      <Copy className="h-3 w-3" />
                    </button>
                  </div>
                </div>
              ))}
              {loading && (
                <div className="flex flex-row-reverse gap-3">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gray-200">
                    <img src="/dark.svg" alt="" className="h-4 w-4" />
                  </div>
                  <div className="rounded-2xl bg-white border border-gray-200/80 px-4 py-3">
                    <Loader2 className="h-4 w-4 animate-spin text-gray-400" />
                  </div>
                </div>
              )}
              <div ref={scrollRef} />
            </div>
          )}
        </div>

        {/* Input — pinned at bottom */}
        <div className="shrink-0 mx-auto w-full max-w-3xl px-4 pb-4 pt-2">
          <form onSubmit={handleSubmit}>
            <div className="rounded-2xl border border-gray-200/80 bg-white shadow-[0_2px_12px_rgba(0,0,0,0.06)] p-3">
              <textarea
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ask whatever you want...."
                rows={1}
                className="w-full resize-none bg-transparent text-sm placeholder:text-gray-400 focus:outline-none"
              />
              <div className="mt-2 flex items-center justify-end">
                <button
                  type="submit"
                  disabled={loading || !input.trim()}
                  className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-900 text-white transition-all hover:scale-105 disabled:opacity-30"
                >
                  <Send className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>

      {/* Right sidebar — Chat History (fixed, not scrolling with content) */}
      {showHistory && (
        <div className="hidden lg:flex w-72 shrink-0 flex-col border-l border-gray-200/80 bg-gray-50/50 h-full">
          <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200/60">
            <h3 className="text-sm font-semibold text-gray-900">Recent chats</h3>
            <div className="flex items-center gap-1">
              {chatHistory.length > 0 && (
                <button
                  onClick={clearHistory}
                  className="text-xs text-red-500 hover:text-red-700 font-medium"
                >
                  Clear all
                </button>
              )}
            </div>
          </div>

          <div className="flex-1 overflow-y-auto">
            {chatHistory.length === 0 ? (
              <div className="px-4 py-8 text-center">
                <MessageSquare className="mx-auto h-8 w-8 text-gray-300" />
                <p className="mt-2 text-xs text-gray-400">No recent chats</p>
              </div>
            ) : (
              <div className="py-2">
                {chatHistory.map((chat) => (
                  <button
                    key={chat.id}
                    onClick={() => loadChat(chat)}
                    className={`group flex w-full items-start gap-2 px-4 py-2.5 text-left transition-colors hover:bg-gray-100 ${activeChatId === chat.id ? "bg-gray-100" : ""}`}
                  >
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium text-gray-700 truncate">
                        {chat.preview}
                      </p>
                      <p className="text-[10px] text-gray-400 mt-0.5">
                        {formatDate(chat.date)} &middot; {chat.messages.length} msgs
                      </p>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
