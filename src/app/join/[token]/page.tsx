"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Loader2, CheckCircle2, XCircle, ChevronLeft, Users, FileText, Lock } from "lucide-react";
import { api } from "@/lib/api";

interface DocInfo {
  id: string;
  title: string;
  emoji: string;
  owner?: string;
}

export default function JoinPage({ params }: { params: { token: string } }) {
  const router = useRouter();
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [docInfo, setDocInfo] = useState<DocInfo | null>(null);
  const [countdown, setCountdown] = useState(3);

  useEffect(() => {
    const validateToken = async () => {
      // Cinematic loading delay
      await new Promise(resolve => setTimeout(resolve, 1000));

      try {
        const token = params.token;
        const foundDoc = await api.documents.getByToken(token);

        if (foundDoc) {
          setDocInfo({
            id: foundDoc.id,
            title: foundDoc.title,
            emoji: foundDoc.emoji,
            owner: (foundDoc as any).owner?.name || "A teammate",
          });
          setStatus("success");

          // Countdown redirect
          let count = 3;
          const interval = setInterval(() => {
            count--;
            setCountdown(count);
            if (count <= 0) {
              clearInterval(interval);
              router.push(`/editor/${foundDoc.id}`);
            }
          }, 1000);
        } else {
          setStatus("error");
        }
      } catch (err) {
        console.error("Token validation error:", err);
        setStatus("error");
      }
    };

    validateToken();
  }, [params.token, router]);

  return (
    <div
      className="min-h-screen flex items-center justify-center p-6 relative overflow-hidden"
      style={{ background: "var(--background)" }}
    >
      {/* Background glow */}
      <div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full filter blur-[120px] opacity-10 pointer-events-none"
        style={{ background: "var(--accent)" }}
      />
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-[var(--accent)] to-transparent opacity-30" />

      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ type: "spring", stiffness: 300, damping: 25 }}
        className="max-w-md w-full text-center"
        style={{
          background: "rgba(var(--surface-rgb), 0.5)",
          backdropFilter: "blur(20px)",
          border: "1px solid rgba(var(--border-rgb), 0.3)",
          borderRadius: "24px",
          padding: "40px 32px",
          boxShadow: "0 25px 60px rgba(0,0,0,0.15)",
        }}
      >
        {/* Logo */}
        <div className="mb-6 flex justify-center">
          <motion.div
            className="w-16 h-16 rounded-2xl flex items-center justify-center"
            style={{ background: "rgba(var(--accent-rgb), 0.12)", border: "1px solid rgba(var(--accent-rgb), 0.2)" }}
            animate={status === "loading" ? { rotate: [0, 5, -5, 0] } : {}}
            transition={{ repeat: Infinity, duration: 2 }}
          >
            <AnimatePresence mode="wait">
              {status === "loading" && (
                <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                  <Loader2 size={32} className="text-[var(--accent)] animate-spin" />
                </motion.div>
              )}
              {status === "success" && (
                <motion.div
                  key="success"
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ type: "spring", stiffness: 500, damping: 20 }}
                >
                  <CheckCircle2 size={32} className="text-[var(--success)]" />
                </motion.div>
              )}
              {status === "error" && (
                <motion.div
                  key="error"
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ type: "spring", stiffness: 500, damping: 20 }}
                >
                  <XCircle size={32} style={{ color: "var(--error, #ef4444)" }} />
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </div>

        <AnimatePresence mode="wait">
          {status === "loading" && (
            <motion.div key="loading-content" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <h1 className="text-2xl font-bold mb-2" style={{ color: "var(--foreground)" }}>
                Validating Invitation...
              </h1>
              <p className="text-sm opacity-60 mb-8 px-4" style={{ color: "var(--muted)" }}>
                Checking your invitation token. This will only take a moment.
              </p>
              <div className="flex justify-center gap-1.5">
                {[0, 1, 2].map(i => (
                  <motion.div
                    key={i}
                    className="w-2 h-2 rounded-full"
                    style={{ background: "var(--accent)" }}
                    animate={{ scale: [1, 1.5, 1], opacity: [0.4, 1, 0.4] }}
                    transition={{ repeat: Infinity, duration: 1.2, delay: i * 0.2 }}
                  />
                ))}
              </div>
            </motion.div>
          )}

          {status === "success" && docInfo && (
            <motion.div key="success-content" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
              <h1 className="text-2xl font-bold mb-2" style={{ color: "var(--foreground)" }}>
                You&apos;re In! 🎉
              </h1>
              <p className="text-sm opacity-60 mb-6" style={{ color: "var(--muted)" }}>
                {docInfo.owner ? `${docInfo.owner} invited you to collaborate.` : "You've been invited to collaborate."}
              </p>

              {/* Document preview */}
              <div
                className="rounded-2xl p-4 mb-6 text-left"
                style={{
                  background: "rgba(var(--accent-rgb), 0.06)",
                  border: "1px solid rgba(var(--accent-rgb), 0.2)",
                }}
              >
                <div className="flex items-center gap-3">
                  <span className="text-3xl">{docInfo.emoji}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold truncate" style={{ color: "var(--foreground)" }}>
                      {docInfo.title}
                    </p>
                    <div className="flex items-center gap-1.5 mt-1">
                      <div className="w-1.5 h-1.5 rounded-full bg-[var(--success)]" />
                      <span className="text-xs" style={{ color: "var(--muted)" }}>
                        Edit access granted
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-4 mt-3 pt-3 border-t" style={{ borderColor: "rgba(var(--border-rgb),0.2)" }}>
                  <div className="flex items-center gap-1.5 text-xs" style={{ color: "var(--muted)" }}>
                    <Users size={11} />
                    Collaborative Editing
                  </div>
                  <div className="flex items-center gap-1.5 text-xs" style={{ color: "var(--muted)" }}>
                    <FileText size={11} />
                    Full Document Access
                  </div>
                </div>
              </div>

              <p className="text-xs mb-4" style={{ color: "var(--muted)" }}>
                Redirecting to document in{" "}
                <span className="font-bold" style={{ color: "var(--accent)" }}>
                  {countdown}s
                </span>
                ...
              </p>

              <button
                onClick={() => router.push(`/editor/${docInfo.id}`)}
                className="btn-primary w-full py-3 text-sm font-semibold"
              >
                Open Document Now →
              </button>
            </motion.div>
          )}

          {status === "error" && (
            <motion.div key="error-content" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
              <h1 className="text-2xl font-bold mb-2" style={{ color: "var(--foreground)" }}>
                Invalid Invitation
              </h1>
              <p className="text-sm opacity-60 mb-6 px-4" style={{ color: "var(--muted)" }}>
                This invitation link is invalid or has expired. Please ask the document owner for a new link.
              </p>

              <div
                className="rounded-xl p-3 mb-6 flex items-center gap-2 text-xs"
                style={{
                  background: "rgba(239,68,68,0.08)",
                  border: "1px solid rgba(239,68,68,0.2)",
                  color: "var(--muted)",
                }}
              >
                <Lock size={12} style={{ color: "#ef4444" }} />
                Token: <code className="font-mono opacity-60">{params.token}</code>
              </div>

              <button
                onClick={() => router.push("/dashboard")}
                className="btn-primary w-full py-3"
              >
                <ChevronLeft size={16} />
                Back to Dashboard
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
