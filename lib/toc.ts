/**
 * תוכן עניינים למדריכים — חילוץ כותרות מהתוכן והזרקת עוגנים (id) תואמים.
 * עובד על שני הפורמטים ש-SimpleContent מרנדר: HTML מהעורך העשיר (Tiptap)
 * והתחביר הקליל (## / ###). המספור חייב להיות זהה בחילוץ ובהזרקה —
 * לכן שתי הפונקציות משתמשות באותו regex ובאותה ספירה.
 */

export interface TocHeading {
  id: string;
  text: string;
  level: 2 | 3;
}

/** זוגות h2/h3 שלמים בלבד — כותרת לא סגורה לא נספרת בשום צד */
const HTML_HEADING_RE = /<h([23])(\s[^>]*)?>([\s\S]*?)<\/h\1>/gi;

const isHtmlContent = (content: string) => content.trimStart().startsWith("<");

function stripTags(html: string): string {
  return html
    .replace(/<[^>]+>/g, "")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .trim();
}

const headingId = (index: number) => `guide-section-${index}`;

/** חלוקת תוכן בתחביר הקליל לבלוקים — זהה לחלוקה ב-SimpleContent */
export function splitBlocks(content: string): string[] {
  return content
    .split(/\n\s*\n/)
    .map((b) => b.trim())
    .filter(Boolean);
}

/** כל הכותרות בתוכן, לפי סדר הופעה, עם ה-id שיוזרק להן ברינדור */
export function extractHeadings(content: string): TocHeading[] {
  if (!content) return [];
  const headings: TocHeading[] = [];

  if (isHtmlContent(content)) {
    let index = 0;
    for (const match of content.matchAll(HTML_HEADING_RE)) {
      index += 1;
      const text = stripTags(match[3]);
      if (text) headings.push({ id: headingId(index), text, level: match[1] === "2" ? 2 : 3 });
    }
    return headings;
  }

  let index = 0;
  for (const block of splitBlocks(content)) {
    if (block.startsWith("### ")) {
      index += 1;
      const text = block.slice(4).trim();
      if (text) headings.push({ id: headingId(index), text, level: 3 });
    } else if (block.startsWith("## ")) {
      index += 1;
      const text = block.slice(3).trim();
      if (text) headings.push({ id: headingId(index), text, level: 2 });
    }
  }
  return headings;
}

/** הזרקת id לכותרות בתוכן HTML — באותו סדר ספירה של extractHeadings */
export function injectHeadingIds(html: string): string {
  let index = 0;
  return html.replace(HTML_HEADING_RE, (_match, level: string, attrs = "", inner: string) => {
    index += 1;
    const cleanAttrs = (attrs ?? "").replace(/\sid\s*=\s*(?:"[^"]*"|'[^']*'|[^\s>]+)/gi, "");
    return `<h${level}${cleanAttrs} id="${headingId(index)}">${inner}</h${level}>`;
  });
}

/** ה-id של כותרת בתחביר הקליל לפי מיקומה הסידורי (1-based) */
export function lightHeadingId(index: number): string {
  return headingId(index);
}
