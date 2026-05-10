"use client";

import { motion } from "framer-motion";
import { FileText, MoreHorizontal, Clock, Star, Trash2, ExternalLink } from "lucide-react";
import { useState } from "react";
import { useRouter } from "next/navigation";

export interface Document {
  id: string;
  title: string;
  emoji: string;
  excerpt: string;
  updatedAt: string;
  updatedBy: string;
  starred: boolean;
  shared: boolean;
}

interface DocumentCardProps {
  doc: Document;
  onDelete?: (id: string) => void;
  onStar?: (id: string) => void;
  index?: number;
}

export default function DocumentCard({
  doc,
  onDelete,
  onStar,
  index = 0,
}: DocumentCardProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [hovered, setHovered] = useState(false);
  const router = useRouter();

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05, duration: 0.25 }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => { setHovered(false); setMenuOpen(false); }}
      onClick={() => router.push(`/editor/${doc.id}`)}
      className="group relative cursor-pointer rounded-2xl border transition-all"
      style={{
        background: "var(--surface)",
        borderColor: hovered ? "var(--border-focus)" : "var(--border)",
        boxShadow: hovered ? "var(--shadow-md)" : "var(--shadow-sm)",
        transform: hovered ? "translateY(-1px)" : "translateY(0)",
        transition: "all 0.18s cubic-bezier(0.4, 0, 0.2, 1)",
      }}
    >
      {/* Card body */}
      <div className="p-4">
        <div className="flex items-start gap-3">
          {/* Emoji / icon */}
          <div
            className="w-9 h-9 rounded-xl flex items-center justify-center text-lg flex-shrink-0 mt-0.5"
            style={{ background: "var(--background)", border: "1px solid var(--border)" }}
          >
            {doc.emoji}
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <h3
                className="font-semibold text-sm leading-snug truncate pr-2"
                style={{ color: "var(--foreground)" }}
              >
                {doc.title}
              </h3>

              {/* Action row — visible on hover */}
              <div
                className="flex items-center gap-1 flex-shrink-0 transition-opacity"
                style={{ opacity: hovered ? 1 : 0 }}
                onClick={(e) => e.stopPropagation()}
              >
                <button
                  onClick={() => onStar?.(doc.id)}
                  className="w-6 h-6 rounded flex items-center justify-center transition-all"
                  style={{ color: doc.starred ? "#f59e0b" : "var(--muted)" }}
                >
                  <Star size={12} fill={doc.starred ? "currentColor" : "none"} />
                </button>
                <div className="relative">
                  <button
                    onClick={() => setMenuOpen(!menuOpen)}
                    className="w-6 h-6 rounded flex items-center justify-center transition-all"
                    style={{ color: "var(--muted)" }}
                    onMouseEnter={(e) =>
                      ((e.currentTarget as HTMLElement).style.background = "var(--surface-hover)")
                    }
                    onMouseLeave={(e) =>
                      ((e.currentTarget as HTMLElement).style.background = "transparent")
                    }
                  >
                    <MoreHorizontal size={13} />
                  </button>
                  {menuOpen && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.94, y: 4 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      className="absolute right-0 top-full mt-1 w-40 surface z-20 overflow-hidden"
                      style={{ boxShadow: "var(--shadow-lg)" }}
                    >
                      <button
                        className="w-full flex items-center gap-2.5 px-3 py-2 text-xs transition-all"
                        style={{ color: "var(--foreground)" }}
                        onMouseEnter={(e) =>
                          (e.currentTarget.style.background = "var(--surface-hover)")
                        }
                        onMouseLeave={(e) =>
                          (e.currentTarget.style.background = "transparent")
                        }
                        onClick={() => router.push(`/editor/${doc.id}`)}
                      >
                        <ExternalLink size={12} style={{ color: "var(--muted)" }} />
                        Open
                      </button>
                      <button
                        className="w-full flex items-center gap-2.5 px-3 py-2 text-xs transition-all"
                        style={{ color: "var(--foreground)" }}
                        onMouseEnter={(e) =>
                          (e.currentTarget.style.background = "var(--surface-hover)")
                        }
                        onMouseLeave={(e) =>
                          (e.currentTarget.style.background = "transparent")
                        }
                        onClick={() => onStar?.(doc.id)}
                      >
                        <Star size={12} style={{ color: "var(--muted)" }} />
                        {doc.starred ? "Unstar" : "Star"}
                      </button>
                      <div style={{ borderTop: "1px solid var(--border)" }}>
                        <button
                          className="w-full flex items-center gap-2.5 px-3 py-2 text-xs transition-all"
                          style={{ color: "var(--danger)" }}
                          onMouseEnter={(e) =>
                            (e.currentTarget.style.background = "var(--surface-hover)")
                          }
                          onMouseLeave={(e) =>
                            (e.currentTarget.style.background = "transparent")
                          }
                          onClick={() => onDelete?.(doc.id)}
                        >
                          <Trash2 size={12} />
                          Delete
                        </button>
                      </div>
                    </motion.div>
                  )}
                </div>
              </div>
            </div>

            <p
              className="text-xs mt-1 line-clamp-2 leading-relaxed"
              style={{ color: "var(--muted)" }}
            >
              {doc.excerpt}
            </p>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div
        className="px-4 py-2.5 border-t flex items-center gap-2"
        style={{ borderColor: "var(--border)" }}
      >
        <Clock size={11} style={{ color: "var(--muted)" }} />
        <span className="text-xs" style={{ color: "var(--muted)" }}>
          {doc.updatedAt} · {doc.updatedBy}
        </span>
        {doc.shared && (
          <span
            className="ml-auto text-xs px-1.5 py-0.5 rounded-md font-medium"
            style={{
              background: "var(--accent-light)",
              color: "var(--accent)",
            }}
          >
            Shared
          </span>
        )}
      </div>
    </motion.div>
  );
}
