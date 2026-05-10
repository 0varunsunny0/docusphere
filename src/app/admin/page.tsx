"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import {
  Users, FileText, BarChart3, Shield, Search, Trash2, Edit3,
  ChevronRight, ArrowLeft, Eye, Download, Activity, Clock,
  AlertTriangle, CheckCircle, XCircle, RefreshCw
} from "lucide-react";

type Tab = "users" | "documents" | "analytics";

interface AdminUser {
  id: string;
  email: string;
  name: string | null;
  role: string;
  streak: number;
  createdAt: string;
  _count: { documents: number };
}

interface AdminDoc {
  id: string;
  title: string;
  emoji: string;
  shared: boolean;
  starred: boolean;
  updatedAt: string;
  owner: { name: string | null; email: string };
}

interface AnalyticsEvent {
  id: number;
  eventName: string;
  createdAt: string;
  user: { name: string | null; email: string };
  document: { title: string } | null;
}

export default function AdminPage() {
  const router = useRouter();
  const [tab, setTab] = useState<Tab>("users");
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [documents, setDocuments] = useState<AdminDoc[]>([]);
  const [analytics, setAnalytics] = useState<AnalyticsEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);

  useEffect(() => {
    loadData();
  }, [tab]);

  const loadData = async () => {
    setLoading(true);
    try {
      if (tab === "users") {
        const res = await fetch("/api/admin/users");
        if (res.ok) setUsers(await res.json());
      } else if (tab === "documents") {
        const res = await fetch("/api/admin/documents");
        if (res.ok) setDocuments(await res.json());
      } else {
        const res = await fetch("/api/admin/analytics");
        if (res.ok) setAnalytics(await res.json());
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteUser = async (id: string) => {
    await fetch(`/api/admin/users/${id}`, { method: "DELETE" });
    setUsers((prev) => prev.filter((u) => u.id !== id));
    setConfirmDelete(null);
  };

  const handleToggleRole = async (id: string, currentRole: string) => {
    const newRole = currentRole === "admin" ? "user" : "admin";
    await fetch(`/api/admin/users/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ role: newRole }),
    });
    setUsers((prev) =>
      prev.map((u) => (u.id === id ? { ...u, role: newRole } : u))
    );
  };

  const handleDeleteDoc = async (id: string) => {
    await fetch(`/api/admin/documents/${id}`, { method: "DELETE" });
    setDocuments((prev) => prev.filter((d) => d.id !== id));
    setConfirmDelete(null);
  };

  const formatDate = (d: string) =>
    new Date(d).toLocaleDateString("en-US", {
      month: "short", day: "numeric", year: "numeric", hour: "2-digit", minute: "2-digit",
    });

  const tabs: { key: Tab; label: string; icon: any; count: number }[] = [
    { key: "users", label: "Users", icon: Users, count: users.length },
    { key: "documents", label: "Documents", icon: FileText, count: documents.length },
    { key: "analytics", label: "Analytics", icon: BarChart3, count: analytics.length },
  ];

  return (
    <div className="min-h-screen bg-[var(--background)]">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-[var(--surface)] border-b border-[var(--border)]">
        <div className="max-w-[1400px] mx-auto flex items-center h-14 px-4 gap-4">
          <button
            onClick={() => router.push("/dashboard")}
            className="p-2 rounded-lg hover:bg-[var(--surface-hover)] text-[var(--muted)]"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-[var(--accent)]" />
            <span className="font-bold text-[var(--foreground)]">Admin Panel</span>
          </div>
          <div className="flex-1" />
          <div className="flex gap-1 bg-[var(--background)] border border-[var(--border)] rounded-xl p-1">
            {tabs.map((t) => (
              <button
                key={t.key}
                onClick={() => setTab(t.key)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  tab === t.key
                    ? "bg-[var(--accent)] text-white shadow-sm"
                    : "text-[var(--muted)] hover:text-[var(--foreground)]"
                }`}
              >
                <t.icon className="w-3.5 h-3.5" />
                {t.label}
              </button>
            ))}
          </div>
        </div>
      </header>

      <main className="max-w-[1400px] mx-auto px-4 py-6">
        {/* Search */}
        <div className="mb-6">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--muted)]" />
            <input
              type="text"
              placeholder={`Search ${tab}...`}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-[var(--surface)] border border-[var(--border)] rounded-xl py-2.5 pl-10 pr-4 text-sm outline-none focus:border-[var(--accent)] transition-all"
            />
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
            <RefreshCw className="w-6 h-6 text-[var(--accent)] animate-spin" />
          </div>
        ) : (
          <AnimatePresence mode="wait">
            {/* ── Users Tab ── */}
            {tab === "users" && (
              <motion.div
                key="users"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
              >
                <div className="bg-[var(--surface)] border border-[var(--border)] rounded-xl overflow-hidden">
                  <div className="grid grid-cols-[1fr_180px_80px_80px_120px_80px] items-center px-4 py-3 border-b border-[var(--border)] text-xs font-semibold text-[var(--muted)] uppercase tracking-wider">
                    <span>User</span>
                    <span>Email</span>
                    <span>Role</span>
                    <span>Docs</span>
                    <span>Joined</span>
                    <span>Actions</span>
                  </div>
                  {users
                    .filter(
                      (u) =>
                        u.email.includes(search.toLowerCase()) ||
                        (u.name || "").toLowerCase().includes(search.toLowerCase())
                    )
                    .map((user, i) => (
                      <motion.div
                        key={user.id}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: i * 0.02 }}
                        className="grid grid-cols-[1fr_180px_80px_80px_120px_80px] items-center px-4 py-3 border-b border-[var(--border)] last:border-b-0 hover:bg-[var(--surface-hover)] transition-colors"
                      >
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white text-xs font-bold">
                            {user.name?.[0]?.toUpperCase() || "U"}
                          </div>
                          <span className="text-sm font-medium text-[var(--foreground)] truncate">
                            {user.name || "Unnamed"}
                          </span>
                        </div>
                        <span className="text-xs text-[var(--muted)] truncate">{user.email}</span>
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold w-fit ${
                            user.role === "admin"
                              ? "bg-amber-100 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400"
                              : "bg-gray-100 text-gray-600 dark:bg-gray-500/10 dark:text-gray-400"
                          }`}
                        >
                          {user.role}
                        </span>
                        <span className="text-xs text-[var(--muted)]">{user._count?.documents || 0}</span>
                        <span className="text-xs text-[var(--muted)]">{formatDate(user.createdAt)}</span>
                        <div className="flex gap-1">
                          <button
                            onClick={() => handleToggleRole(user.id, user.role)}
                            className="p-1.5 rounded-lg hover:bg-[var(--surface-hover)] text-[var(--muted)] hover:text-[var(--accent)]"
                            title="Toggle role"
                          >
                            <Shield className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => setConfirmDelete(user.id)}
                            className="p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-500/10 text-[var(--muted)] hover:text-red-500"
                            title="Delete user"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </motion.div>
                    ))}
                </div>
              </motion.div>
            )}

            {/* ── Documents Tab ── */}
            {tab === "documents" && (
              <motion.div
                key="documents"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
              >
                <div className="bg-[var(--surface)] border border-[var(--border)] rounded-xl overflow-hidden">
                  <div className="grid grid-cols-[auto_1fr_160px_120px_80px_80px] items-center px-4 py-3 border-b border-[var(--border)] text-xs font-semibold text-[var(--muted)] uppercase tracking-wider">
                    <span className="w-8"></span>
                    <span>Title</span>
                    <span>Owner</span>
                    <span>Modified</span>
                    <span>Status</span>
                    <span>Actions</span>
                  </div>
                  {documents
                    .filter((d) =>
                      d.title.toLowerCase().includes(search.toLowerCase())
                    )
                    .map((doc, i) => (
                      <motion.div
                        key={doc.id}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: i * 0.02 }}
                        className="grid grid-cols-[auto_1fr_160px_120px_80px_80px] items-center px-4 py-3 border-b border-[var(--border)] last:border-b-0 hover:bg-[var(--surface-hover)] transition-colors"
                      >
                        <span className="text-lg w-8">{doc.emoji}</span>
                        <span className="text-sm font-medium text-[var(--foreground)] truncate">{doc.title}</span>
                        <span className="text-xs text-[var(--muted)] truncate">{doc.owner?.name || doc.owner?.email}</span>
                        <span className="text-xs text-[var(--muted)]">{formatDate(doc.updatedAt)}</span>
                        <div className="flex gap-1">
                          {doc.shared && (
                            <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-blue-100 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400">
                              SHARED
                            </span>
                          )}
                        </div>
                        <div className="flex gap-1">
                          <button
                            onClick={() => router.push(`/editor/${doc.id}`)}
                            className="p-1.5 rounded-lg hover:bg-[var(--surface-hover)] text-[var(--muted)] hover:text-[var(--accent)]"
                            title="Open"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => setConfirmDelete(doc.id)}
                            className="p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-500/10 text-[var(--muted)] hover:text-red-500"
                            title="Delete"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </motion.div>
                    ))}
                </div>
              </motion.div>
            )}

            {/* ── Analytics Tab ── */}
            {tab === "analytics" && (
              <motion.div
                key="analytics"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
              >
                {/* Stats cards */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                  {[
                    { label: "Total Events", value: analytics.length, icon: Activity, color: "text-blue-500" },
                    { label: "Document Opens", value: analytics.filter((a) => a.eventName === "document.open").length, icon: Eye, color: "text-green-500" },
                    { label: "Edits", value: analytics.filter((a) => a.eventName === "document.edit").length, icon: Edit3, color: "text-purple-500" },
                    { label: "Shares", value: analytics.filter((a) => a.eventName === "document.share").length, icon: Users, color: "text-amber-500" },
                  ].map((stat) => (
                    <div key={stat.label} className="bg-[var(--surface)] border border-[var(--border)] rounded-xl p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <stat.icon className={`w-4 h-4 ${stat.color}`} />
                        <span className="text-xs text-[var(--muted)] font-medium">{stat.label}</span>
                      </div>
                      <p className="text-2xl font-bold text-[var(--foreground)]">{stat.value}</p>
                    </div>
                  ))}
                </div>

                {/* Event log */}
                <div className="bg-[var(--surface)] border border-[var(--border)] rounded-xl overflow-hidden">
                  <div className="grid grid-cols-[1fr_160px_160px_140px] items-center px-4 py-3 border-b border-[var(--border)] text-xs font-semibold text-[var(--muted)] uppercase tracking-wider">
                    <span>Event</span>
                    <span>User</span>
                    <span>Document</span>
                    <span>Time</span>
                  </div>
                  {analytics
                    .filter((a) =>
                      a.eventName.includes(search.toLowerCase()) ||
                      a.user?.email?.includes(search.toLowerCase())
                    )
                    .slice(0, 100)
                    .map((evt, i) => (
                      <motion.div
                        key={evt.id}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: i * 0.01 }}
                        className="grid grid-cols-[1fr_160px_160px_140px] items-center px-4 py-2.5 border-b border-[var(--border)] last:border-b-0 hover:bg-[var(--surface-hover)] transition-colors"
                      >
                        <div className="flex items-center gap-2">
                          <span className={`w-2 h-2 rounded-full ${
                            evt.eventName.includes("delete") ? "bg-red-500" :
                            evt.eventName.includes("create") ? "bg-green-500" :
                            evt.eventName.includes("edit") ? "bg-blue-500" :
                            "bg-gray-400"
                          }`} />
                          <span className="text-xs font-mono text-[var(--foreground)]">{evt.eventName}</span>
                        </div>
                        <span className="text-xs text-[var(--muted)] truncate">{evt.user?.name || evt.user?.email}</span>
                        <span className="text-xs text-[var(--muted)] truncate">{evt.document?.title || "—"}</span>
                        <span className="text-xs text-[var(--muted)]">{formatDate(evt.createdAt)}</span>
                      </motion.div>
                    ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        )}
      </main>

      {/* Confirm Delete Modal */}
      <AnimatePresence>
        {confirmDelete && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
            onClick={() => setConfirmDelete(null)}
          >
            <motion.div
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.95 }}
              onClick={(e) => e.stopPropagation()}
              className="w-[360px] bg-[var(--surface)] border border-[var(--border)] rounded-2xl p-6 shadow-2xl"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-red-100 dark:bg-red-500/10 flex items-center justify-center">
                  <AlertTriangle className="w-5 h-5 text-red-500" />
                </div>
                <div>
                  <h3 className="font-bold text-[var(--foreground)]">Confirm Delete</h3>
                  <p className="text-xs text-[var(--muted)]">This action cannot be undone.</p>
                </div>
              </div>
              <div className="flex gap-2 justify-end">
                <button
                  onClick={() => setConfirmDelete(null)}
                  className="px-4 py-2 rounded-lg text-sm font-medium text-[var(--muted)] hover:bg-[var(--surface-hover)] transition-all"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    if (tab === "users") handleDeleteUser(confirmDelete);
                    else handleDeleteDoc(confirmDelete);
                  }}
                  className="px-4 py-2 rounded-lg text-sm font-medium text-white bg-red-500 hover:bg-red-600 transition-all"
                >
                  Confirm
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
