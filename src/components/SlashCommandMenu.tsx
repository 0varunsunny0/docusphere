"use client";

import { motion, AnimatePresence } from "framer-motion";
import {
  Heading1,
  Heading2,
  Heading3,
  List,
  ListOrdered,
  Code,
  Quote,
  Minus,
  Image,
  Table,
  CheckSquare,
} from "lucide-react";
import { Editor } from "@tiptap/react";

interface SlashCommandMenuProps {
  editor: Editor | null;
  open: boolean;
  onClose: () => void;
  position?: { top: number; left: number };
}

const COMMANDS = [
  {
    group: "Text",
    items: [
      {
        icon: "H1",
        label: "Heading 1",
        description: "Big section heading",
        iconEl: <Heading1 size={13} />,
        action: (editor: Editor) =>
          editor.chain().focus().toggleHeading({ level: 1 }).run(),
      },
      {
        icon: "H2",
        label: "Heading 2",
        description: "Medium section heading",
        iconEl: <Heading2 size={13} />,
        action: (editor: Editor) =>
          editor.chain().focus().toggleHeading({ level: 2 }).run(),
      },
      {
        icon: "H3",
        label: "Heading 3",
        description: "Small section heading",
        iconEl: <Heading3 size={13} />,
        action: (editor: Editor) =>
          editor.chain().focus().toggleHeading({ level: 3 }).run(),
      },
    ],
  },
  {
    group: "Lists",
    items: [
      {
        icon: "•",
        label: "Bullet List",
        description: "A simple bulleted list",
        iconEl: <List size={13} />,
        action: (editor: Editor) =>
          editor.chain().focus().toggleBulletList().run(),
      },
      {
        icon: "1.",
        label: "Numbered List",
        description: "An ordered numbered list",
        iconEl: <ListOrdered size={13} />,
        action: (editor: Editor) =>
          editor.chain().focus().toggleOrderedList().run(),
      },
      {
        icon: "[]",
        label: "Task List",
        description: "An interactive checklist",
        iconEl: <CheckSquare size={13} />,
        action: (editor: Editor) =>
          (editor.chain().focus() as any).toggleTaskList().run(),
      },
    ],
  },
  {
    group: "Blocks",
    items: [
      {
        icon: "</>",
        label: "Code Block",
        description: "A code block with syntax highlight",
        iconEl: <Code size={13} />,
        action: (editor: Editor) =>
          editor.chain().focus().toggleCodeBlock().run(),
      },
      {
        icon: `"`,
        label: "Blockquote",
        description: "Capture a quote or callout",
        iconEl: <Quote size={13} />,
        action: (editor: Editor) =>
          editor.chain().focus().toggleBlockquote().run(),
      },
      {
        icon: "—",
        label: "Divider",
        description: "A horizontal separator line",
        iconEl: <Minus size={13} />,
        action: (editor: Editor) =>
          editor.chain().focus().setHorizontalRule().run(),
      },
    ],
  },
];

export default function SlashCommandMenu({
  editor,
  open,
  onClose,
  position,
}: SlashCommandMenuProps) {
  const handleCommand = (action: (editor: Editor) => void) => {
    if (!editor) return;
    // Delete the "/" character first
    const { from } = editor.state.selection;
    editor.chain().focus().deleteRange({ from: from - 1, to: from }).run();
    action(editor);
    onClose();
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0, y: 6, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 4, scale: 0.96 }}
          transition={{ type: "spring", stiffness: 500, damping: 30 }}
          className="slash-menu fixed z-50"
          style={
            position
              ? { top: position.top, left: position.left }
              : { top: "50%", left: "50%", transform: "translate(-50%,-50%)" }
          }
        >
          {COMMANDS.map((group) => (
            <div key={group.group}>
              <p
                className="px-2 pt-2 pb-1 text-[10px] font-semibold tracking-wider uppercase"
                style={{ color: "var(--muted)" }}
              >
                {group.group}
              </p>
              {group.items.map((item) => (
                <button
                  key={item.label}
                  className="slash-menu-item w-full text-left"
                  onClick={() => handleCommand(item.action)}
                >
                  <span className="slash-menu-item-icon">{item.iconEl}</span>
                  <span>
                    <span className="block font-medium text-xs" style={{ color: "var(--foreground)" }}>
                      {item.label}
                    </span>
                    <span className="block text-[10px]" style={{ color: "var(--muted)" }}>
                      {item.description}
                    </span>
                  </span>
                </button>
              ))}
            </div>
          ))}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
