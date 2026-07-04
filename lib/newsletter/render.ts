/**
 * רנדור ניוזלטר ל-HTML של מייל: טבלאות + סגנונות inline (מה שתוכנות מייל מבינות),
 * RTL מלא, ובשפה העיצובית של האתר — כרטיס לבן, כותרת גרדיאנט כחול→סגול.
 *
 * התוכן נכתב באותו תחביר קליל של עורך התוכן באדמין:
 * ‎## כותרת · ‎### תת-כותרת · ‎- רשימה · שורה ריקה = פסקה ·
 * ‎![alt](url) תמונה · ‎@video(url) כפתור צפייה · [טקסט](קישור).
 *
 * הקובץ טהור (בלי תלות בשרת) — משמש גם לתצוגה המקדימה בדפדפן וגם לשליחה.
 */

const BLUE = "#4f7bff";
const PURPLE = "#7c5cff";
const INK = "#111827";
const MUTED = "#6b7280";

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

const IMAGE_RE = /^!\[([^\]]*)\]\(([^)\s]+)\)$/;
const VIDEO_RE = /^@video\(([^)\s]+)\)$/;
const LINK_RE = /\[([^\]]+)\]\((https?:\/\/[^)\s]+|\/[^)\s]*)\)/g;

const isSafeUrl = (url: string) => /^https?:\/\//.test(url) || url.startsWith("/");

/** קישורים בתוך שורת טקסט (הטקסט כבר escaped) */
function renderInline(escaped: string, siteUrl: string): string {
  return escaped.replace(LINK_RE, (match, label: string, url: string) => {
    if (!isSafeUrl(url)) return match;
    const href = url.startsWith("/") ? siteUrl + url : url;
    return `<a href="${escapeHtml(href)}" style="color:${BLUE};font-weight:700;text-decoration:underline;">${label}</a>`;
  });
}

/** המרת תוכן התחביר הקליל ל-HTML של מייל */
export function contentToEmailHtml(content: string, siteUrl: string): string {
  const blocks = content
    .split(/\n\s*\n/)
    .map((b) => b.trim())
    .filter(Boolean);

  const parts: string[] = [];

  for (const rawBlock of blocks) {
    if (rawBlock.startsWith("### ")) {
      parts.push(
        `<h3 style="margin:22px 0 6px;font-size:19px;font-weight:800;color:${INK};">${renderInline(escapeHtml(rawBlock.slice(4)), siteUrl)}</h3>`
      );
      continue;
    }
    if (rawBlock.startsWith("## ")) {
      parts.push(
        `<h2 style="margin:28px 0 8px;font-size:23px;font-weight:900;color:${INK};">${renderInline(escapeHtml(rawBlock.slice(3)), siteUrl)}</h2>`
      );
      continue;
    }

    const imageMatch = rawBlock.match(IMAGE_RE);
    if (imageMatch && isSafeUrl(imageMatch[2])) {
      const src = imageMatch[2].startsWith("/") ? siteUrl + imageMatch[2] : imageMatch[2];
      parts.push(
        `<img src="${escapeHtml(src)}" alt="${escapeHtml(imageMatch[1])}" width="536" style="display:block;width:100%;max-width:536px;height:auto;border-radius:16px;margin:18px 0;" />`
      );
      continue;
    }

    const videoMatch = rawBlock.match(VIDEO_RE);
    if (videoMatch && isSafeUrl(videoMatch[1])) {
      const href = videoMatch[1].startsWith("/") ? siteUrl + videoMatch[1] : videoMatch[1];
      parts.push(
        `<table role="presentation" cellpadding="0" cellspacing="0" style="margin:18px auto;"><tr><td style="border-radius:999px;background:linear-gradient(120deg,${BLUE},${PURPLE});">` +
          `<a href="${escapeHtml(href)}" style="display:inline-block;padding:13px 30px;font-weight:700;font-size:16px;color:#ffffff;text-decoration:none;border-radius:999px;">▶ לצפייה בסרטון</a>` +
          `</td></tr></table>`
      );
      continue;
    }

    const lines = rawBlock.split("\n");
    if (lines.every((line) => line.trim().startsWith("- "))) {
      const items = lines
        .map(
          (line) =>
            `<li style="margin:0 0 8px;">${renderInline(escapeHtml(line.trim().slice(2)), siteUrl)}</li>`
        )
        .join("");
      parts.push(
        `<ul style="margin:14px 0;padding:0 22px 0 0;color:${INK};font-size:16px;line-height:1.75;">${items}</ul>`
      );
      continue;
    }

    const paragraph = lines
      .map((line) => renderInline(escapeHtml(line), siteUrl))
      .join("<br />");
    parts.push(
      `<p style="margin:14px 0;color:${INK};font-size:16px;line-height:1.8;">${paragraph}</p>`
    );
  }

  return parts.join("\n");
}

export interface RenderNewsletterOptions {
  subject: string;
  preheader: string;
  content: string;
  siteName: string;
  siteUrl: string;
  /** קישור הסרה אישי — null בתצוגה מקדימה */
  unsubscribeUrl: string | null;
}

/** מסמך המייל המלא */
export function renderNewsletterEmail({
  subject,
  preheader,
  content,
  siteName,
  siteUrl,
  unsubscribeUrl,
}: RenderNewsletterOptions): string {
  const bodyHtml = contentToEmailHtml(content, siteUrl);
  const year = new Date().getFullYear();

  return `<!doctype html>
<html lang="he" dir="rtl">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<title>${escapeHtml(subject)}</title>
</head>
<body style="margin:0;padding:0;background:#f8faff;font-family:'Heebo','Segoe UI',Arial,sans-serif;">
  <!-- preheader מוסתר — השורה שמופיעה ליד הנושא בתיבת הדואר -->
  <div style="display:none;max-height:0;overflow:hidden;mso-hide:all;">${escapeHtml(preheader || subject)}&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;</div>

  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f8faff;">
    <tr>
      <td align="center" style="padding:28px 14px;">
        <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="width:100%;max-width:600px;">

          <!-- פס מותג עליון -->
          <tr>
            <td style="border-radius:24px 24px 0 0;background:linear-gradient(120deg,${BLUE},${PURPLE});padding:22px 32px;" dir="rtl" align="right">
              <span style="font-size:20px;font-weight:900;color:#ffffff;">Ariel <span style="opacity:.85;">AI</span></span>
              <span style="float:left;font-size:13px;font-weight:600;color:rgba(255,255,255,.85);padding-top:5px;">הניוזלטר של ${escapeHtml(siteName)}</span>
            </td>
          </tr>

          <!-- גוף המייל -->
          <tr>
            <td dir="rtl" align="right" style="background:#ffffff;border-radius:0 0 24px 24px;padding:34px 32px 28px;border:1px solid #eef2ff;border-top:0;">
              <h1 style="margin:0 0 6px;font-size:27px;font-weight:900;color:${INK};line-height:1.35;">${escapeHtml(subject)}</h1>
              ${preheader ? `<p style="margin:0 0 8px;font-size:16px;color:${MUTED};line-height:1.7;">${escapeHtml(preheader)}</p>` : ""}
              <div style="height:4px;width:64px;border-radius:99px;background:linear-gradient(120deg,${BLUE},${PURPLE});margin:16px 0 6px;"></div>
              ${bodyHtml}
            </td>
          </tr>

          <!-- פוטר -->
          <tr>
            <td dir="rtl" align="center" style="padding:22px 24px;color:${MUTED};font-size:13px;line-height:1.9;">
              נשלח באהבה מ-<a href="${escapeHtml(siteUrl)}" style="color:${BLUE};font-weight:700;text-decoration:none;">${escapeHtml(siteName)}</a> 🤍
              <br />© ${year} ${escapeHtml(siteName)}. כל הזכויות שמורות.
              ${
                unsubscribeUrl
                  ? `<br /><a href="${escapeHtml(unsubscribeUrl)}" style="color:${MUTED};text-decoration:underline;">להסרה מרשימת התפוצה</a>`
                  : ""
              }
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}
