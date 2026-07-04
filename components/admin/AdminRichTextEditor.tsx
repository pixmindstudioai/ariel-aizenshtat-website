"use client";

import { useEffect, useRef, useState } from "react";
import { useEditor, EditorContent, type Editor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import TiptapImage from "@tiptap/extension-image";
import TiptapLink from "@tiptap/extension-link";
import TextAlign from "@tiptap/extension-text-align";
import Placeholder from "@tiptap/extension-placeholder";
import { Node, mergeAttributes } from "@tiptap/core";
import AdminFormField from "@/components/admin/AdminFormField";
import AdminMediaPicker from "@/components/admin/AdminMediaPicker";
import AssetImage from "@/components/AssetImage";
import { icons } from "@/data/assets";
import { mediaKindFromUrl } from "@/lib/media";

/**
 * עורך תוכן עשיר מבוסס Tiptap (קוד פתוח, tiptap.dev).
 * התוכן נשמר כ-HTML; תוכן ישן בתחביר הקליל (‎##, ‎-, ‎@video וכו')
 * מומר אוטומטית ל-HTML בפתיחת העורך — שום דבר לא הולך לאיבוד.
 * כל המדיה משובצת מספריית המדיה שלנו דרך AdminMediaPicker.
 */

interface AdminRichTextEditorProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  error?: string;
  rows?: number;
}

/* ===== המרת התחביר הקליל הישן ל-HTML (חד-פעמית, בפתיחה) ===== */

const escapeHtml = (s: string) =>
  s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");

const inlineToHtml = (text: string) =>
  escapeHtml(text).replace(
    /\[([^\]]+)\]\((https?:\/\/[^)]+|\/[^)]*)\)/g,
    '<a href="$2">$1</a>'
  );

export function legacyToHtml(content: string): string {
  const blocks = content
    .split(/\n\s*\n/)
    .map((b) => b.trim())
    .filter(Boolean);

  return blocks
    .map((block) => {
      if (block.startsWith("### ")) return `<h3>${inlineToHtml(block.slice(4))}</h3>`;
      if (block.startsWith("## ")) return `<h2>${inlineToHtml(block.slice(3))}</h2>`;

      const image = block.match(/^!\[([^\]]*)\]\(([^)]+)\)$/);
      if (image) return `<img src="${escapeHtml(image[2])}" alt="${escapeHtml(image[1])}">`;

      const video = block.match(/^@video\(([^)]+)\)$/);
      if (video) return `<video controls src="${escapeHtml(video[1])}"></video>`;

      const audio = block.match(/^@audio\(([^)]+)\)$/);
      if (audio) return `<audio controls src="${escapeHtml(audio[1])}"></audio>`;

      const lines = block.split("\n");
      if (lines.every((line) => line.trim().startsWith("- "))) {
        const items = lines
          .map((line) => `<li>${inlineToHtml(line.trim().slice(2))}</li>`)
          .join("");
        return `<ul>${items}</ul>`;
      }

      return `<p>${lines.map(inlineToHtml).join("<br>")}</p>`;
    })
    .join("");
}

/** תוכן שמתחיל בתגית — כבר HTML; אחרת תחביר ישן שדורש המרה */
const toEditorHtml = (value: string) =>
  !value || value.trimStart().startsWith("<") ? value : legacyToHtml(value);

/* ===== צמתים מותאמים: וידאו, אודיו וכפתור CTA ===== */

const VideoNode = Node.create({
  name: "video",
  group: "block",
  atom: true,
  addAttributes() {
    return { src: { default: null }, controls: { default: true } };
  },
  parseHTML() {
    return [{ tag: "video" }];
  },
  renderHTML({ HTMLAttributes }) {
    return [
      "video",
      mergeAttributes(HTMLAttributes, {
        controls: "true",
        style: "max-width:100%;border-radius:20px;margin:12px 0;background:#0f172a",
      }),
    ];
  },
});

const AudioNode = Node.create({
  name: "audio",
  group: "block",
  atom: true,
  addAttributes() {
    return { src: { default: null }, controls: { default: true } };
  },
  parseHTML() {
    return [{ tag: "audio" }];
  },
  renderHTML({ HTMLAttributes }) {
    return [
      "audio",
      mergeAttributes(HTMLAttributes, { controls: "true", style: "width:100%;margin:12px 0" }),
    ];
  },
});

/** כפתור CTA בסגנון האתר — גלולה עם גרדיאנט כחול→סגול */
const CtaButtonNode = Node.create({
  name: "ctaButton",
  group: "block",
  atom: true,
  addAttributes() {
    return { href: { default: "#" }, label: { default: "כפתור" } };
  },
  parseHTML() {
    return [
      {
        tag: 'div[data-type="cta-button"]',
        getAttrs: (el) => {
          const a = (el as HTMLElement).querySelector("a");
          return {
            href: a?.getAttribute("href") ?? "#",
            label: a?.textContent?.trim() ?? "כפתור",
          };
        },
      },
    ];
  },
  renderHTML({ node }) {
    return [
      "div",
      { "data-type": "cta-button", style: "text-align:center;margin:20px 0" },
      [
        "a",
        {
          href: node.attrs.href,
          target: "_blank",
          rel: "noopener noreferrer",
          style:
            "display:inline-block;background:linear-gradient(120deg,#4f7bff,#7c5cff);color:#fff;padding:12px 28px;border-radius:999px;font-weight:700;text-decoration:none;box-shadow:0 10px 30px rgba(79,123,255,0.35)",
        },
        node.attrs.label,
      ],
    ];
  },
});

/* ===== סרגל הכלים ===== */

interface ToolbarButtonProps {
  active?: boolean;
  title: string;
  onClick: () => void;
  children: React.ReactNode;
}

function ToolbarButton({ active, title, onClick, children }: ToolbarButtonProps) {
  return (
    <button
      type="button"
      title={title}
      onClick={onClick}
      className={`inline-flex h-8 min-w-8 items-center justify-center gap-1 rounded-lg px-2 text-xs font-bold transition-colors ${
        active ? "bg-blue/10 text-blue" : "text-muted hover:bg-white hover:text-ink"
      }`}
    >
      {children}
    </button>
  );
}

function Toolbar({
  editor,
  onOpenMedia,
}: {
  editor: Editor;
  onOpenMedia: () => void;
}) {
  const [ctaOpen, setCtaOpen] = useState(false);
  const [ctaLabel, setCtaLabel] = useState("");
  const [ctaUrl, setCtaUrl] = useState("");

  const addLink = () => {
    const url = window.prompt("כתובת הקישור:");
    if (url) {
      editor.chain().focus().extendMarkRange("link").setLink({ href: url }).run();
    } else {
      editor.chain().focus().unsetLink().run();
    }
  };

  const insertCta = () => {
    if (!ctaLabel.trim() || !ctaUrl.trim()) return;
    editor
      .chain()
      .focus()
      .insertContent({ type: "ctaButton", attrs: { href: ctaUrl, label: ctaLabel } })
      .run();
    setCtaOpen(false);
    setCtaLabel("");
    setCtaUrl("");
  };

  return (
    <div className="relative flex flex-wrap items-center gap-1 border-b border-slate-100 bg-slate-50 px-2 py-1.5">
      <ToolbarButton
        title="מודגש"
        active={editor.isActive("bold")}
        onClick={() => editor.chain().focus().toggleBold().run()}
      >
        <strong>B</strong>
      </ToolbarButton>
      <ToolbarButton
        title="נטוי"
        active={editor.isActive("italic")}
        onClick={() => editor.chain().focus().toggleItalic().run()}
      >
        <em>I</em>
      </ToolbarButton>

      <span aria-hidden className="mx-1 h-5 w-px bg-slate-200" />

      <ToolbarButton
        title="כותרת"
        active={editor.isActive("heading", { level: 2 })}
        onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
      >
        H2
      </ToolbarButton>
      <ToolbarButton
        title="תת-כותרת"
        active={editor.isActive("heading", { level: 3 })}
        onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
      >
        H3
      </ToolbarButton>

      <span aria-hidden className="mx-1 h-5 w-px bg-slate-200" />

      <ToolbarButton
        title="רשימה"
        active={editor.isActive("bulletList")}
        onClick={() => editor.chain().focus().toggleBulletList().run()}
      >
        • רשימה
      </ToolbarButton>
      <ToolbarButton
        title="רשימה ממוספרת"
        active={editor.isActive("orderedList")}
        onClick={() => editor.chain().focus().toggleOrderedList().run()}
      >
        1. רשימה
      </ToolbarButton>
      <ToolbarButton
        title="ציטוט"
        active={editor.isActive("blockquote")}
        onClick={() => editor.chain().focus().toggleBlockquote().run()}
      >
        ״ציטוט״
      </ToolbarButton>

      <span aria-hidden className="mx-1 h-5 w-px bg-slate-200" />

      <ToolbarButton
        title="יישור לימין"
        active={editor.isActive({ textAlign: "right" })}
        onClick={() => editor.chain().focus().setTextAlign("right").run()}
      >
        ימין
      </ToolbarButton>
      <ToolbarButton
        title="מרכז"
        active={editor.isActive({ textAlign: "center" })}
        onClick={() => editor.chain().focus().setTextAlign("center").run()}
      >
        מרכז
      </ToolbarButton>

      <span aria-hidden className="mx-1 h-5 w-px bg-slate-200" />

      <ToolbarButton title="קישור" active={editor.isActive("link")} onClick={addLink}>
        <span className="inline-block w-4" aria-hidden>
          <AssetImage asset={icons.browserPages} decorative variant="flat" className="w-full h-auto" />
        </span>
        קישור
      </ToolbarButton>

      <button
        type="button"
        title="שיבוץ תמונה, וידאו או אודיו מספריית המדיה שלנו"
        onClick={onOpenMedia}
        className="inline-flex h-8 items-center gap-1 rounded-lg px-2.5 text-xs font-bold text-blue transition-colors hover:bg-white"
      >
        <span className="inline-block w-5 shrink-0 align-middle" aria-hidden>
          <AssetImage asset={icons.imageUpload} decorative variant="flat" className="w-full h-auto" />
        </span>
        מדיה מהספרייה
      </button>

      <ToolbarButton title="כפתור CTA" active={ctaOpen} onClick={() => setCtaOpen((v) => !v)}>
        <span className="inline-block w-4" aria-hidden>
          <AssetImage asset={icons.plus} decorative variant="flat" className="w-full h-auto" />
        </span>
        כפתור
      </ToolbarButton>

      {ctaOpen && (
        <div className="absolute left-2 top-full z-30 mt-2 flex w-72 flex-col gap-2 rounded-2xl border border-slate-100 bg-white p-4 shadow-[0_18px_50px_rgba(15,23,42,0.14)]">
          <span className="text-xs font-bold text-muted">כפתור קריאה לפעולה</span>
          <input
            className="admin-input"
            placeholder="הטקסט על הכפתור"
            value={ctaLabel}
            onChange={(e) => setCtaLabel(e.target.value)}
          />
          <input
            className="admin-input"
            dir="ltr"
            placeholder="https://..."
            value={ctaUrl}
            onChange={(e) => setCtaUrl(e.target.value)}
          />
          <div className="flex gap-2">
            <button type="button" onClick={insertCta} className="btn-admin-primary flex-1 !py-2">
              שיבוץ
            </button>
            <button
              type="button"
              onClick={() => setCtaOpen(false)}
              className="btn-admin-secondary !py-2"
            >
              ביטול
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

/* ===== העורך ===== */

export default function AdminRichTextEditor({
  label,
  value,
  onChange,
  error,
  rows = 14,
}: AdminRichTextEditorProps) {
  const [pickerOpen, setPickerOpen] = useState(false);
  const lastEmitted = useRef<string | null>(null);
  const minHeight = Math.max(220, rows * 22);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({ heading: { levels: [2, 3] } }),
      TiptapImage.configure({
        HTMLAttributes: {
          style: "max-width:100%;height:auto;border-radius:20px;margin:12px 0",
        },
      }),
      TiptapLink.configure({
        openOnClick: false,
        HTMLAttributes: { style: "color:#4f7bff;text-decoration:underline" },
      }),
      TextAlign.configure({
        types: ["heading", "paragraph"],
        defaultAlignment: "right",
      }),
      Placeholder.configure({ placeholder: "כותבים כאן את התוכן המלא..." }),
      VideoNode,
      AudioNode,
      CtaButtonNode,
    ],
    content: toEditorHtml(value),
    editorProps: {
      attributes: {
        dir: "rtl",
        style: `min-height:${minHeight}px;padding:16px 18px;outline:none;font-size:16px;line-height:1.8;color:#111827`,
      },
    },
    onUpdate({ editor: ed }) {
      const html = ed.getHTML();
      lastEmitted.current = html;
      onChange(html);
    },
    // מניעת SSR mismatch — העורך מרונדר רק בדפדפן
    immediatelyRender: false,
  });

  // סנכרון ערך חיצוני (טעינת רשומה, איפוס טופס) בלי לולאת עדכונים
  useEffect(() => {
    if (!editor || value === lastEmitted.current) return;
    const html = toEditorHtml(value);
    if (html !== editor.getHTML() && !(html === "" && editor.getHTML() === "<p></p>")) {
      editor.commands.setContent(html);
    }
  }, [value, editor]);

  const insertFromLibrary = (url: string, alt: string) => {
    if (!editor) return;
    switch (mediaKindFromUrl(url)) {
      case "video":
        editor.chain().focus().insertContent({ type: "video", attrs: { src: url } }).run();
        break;
      case "audio":
        editor.chain().focus().insertContent({ type: "audio", attrs: { src: url } }).run();
        break;
      case "pdf":
        editor
          .chain()
          .focus()
          .insertContent(`<p><a href="${url}">${alt || "קובץ להורדה"}</a></p>`)
          .run();
        break;
      default:
        editor.chain().focus().setImage({ src: url, alt }).run();
    }
  };

  return (
    <AdminFormField
      label={label}
      error={error}
      hint="עורך עשיר (Tiptap) — מסמנים טקסט ומעצבים מהסרגל; תוכן ישן מהתחביר הפשוט מומר אוטומטית"
    >
      <div
        className="overflow-hidden rounded-2xl border-2 border-slate-100 bg-white focus-within:border-blue"
        aria-invalid={!!error}
      >
        {editor ? (
          <>
            <Toolbar editor={editor} onOpenMedia={() => setPickerOpen(true)} />
            <div className="aa-rich-editor">
              <EditorContent editor={editor} />
            </div>
          </>
        ) : (
          <div
            className="grid place-items-center text-sm font-semibold text-muted"
            style={{ minHeight: minHeight + 42 }}
          >
            טוען עורך...
          </div>
        )}
      </div>

      <style>{`
        .aa-rich-editor .ProseMirror { direction: rtl; text-align: right; }
        .aa-rich-editor .ProseMirror p.is-editor-empty:first-child::before {
          content: attr(data-placeholder);
          float: right;
          color: #9ca3af;
          pointer-events: none;
          height: 0;
        }
        .aa-rich-editor .ProseMirror h2 {
          font-size: 24px; font-weight: 900; margin: 20px 0 8px; line-height: 1.35; color: #111827;
        }
        .aa-rich-editor .ProseMirror h3 {
          font-size: 19px; font-weight: 800; margin: 14px 0 6px; line-height: 1.4; color: #111827;
        }
        .aa-rich-editor .ProseMirror p { margin: 0 0 10px; }
        .aa-rich-editor .ProseMirror ul, .aa-rich-editor .ProseMirror ol {
          padding-right: 22px; margin: 8px 0;
        }
        .aa-rich-editor .ProseMirror ul { list-style: disc; }
        .aa-rich-editor .ProseMirror ol { list-style: decimal; }
        .aa-rich-editor .ProseMirror li { margin-bottom: 4px; }
        .aa-rich-editor .ProseMirror li::marker { color: #4f7bff; }
        .aa-rich-editor .ProseMirror blockquote {
          border-right: 3px solid rgba(79,123,255,0.4);
          padding-right: 14px; margin: 14px 0; color: #6b7280; font-style: italic;
        }
        .aa-rich-editor .ProseMirror img { max-width: 100%; height: auto; border-radius: 20px; margin: 12px 0; }
        .aa-rich-editor .ProseMirror video { max-width: 100%; border-radius: 20px; margin: 12px 0; background: #0f172a; }
        .aa-rich-editor .ProseMirror audio { width: 100%; margin: 12px 0; }
        .aa-rich-editor .ProseMirror a { color: #4f7bff; text-decoration: underline; text-underline-offset: 3px; }
        .aa-rich-editor .ProseMirror div[data-type="cta-button"] { text-align: center; margin: 18px 0; }
        .aa-rich-editor .ProseMirror .ProseMirror-selectednode { outline: 3px solid rgba(79,123,255,0.4); border-radius: 20px; }
      `}</style>

      <AdminMediaPicker
        open={pickerOpen}
        onClose={() => setPickerOpen(false)}
        onSelect={insertFromLibrary}
      />
    </AdminFormField>
  );
}
