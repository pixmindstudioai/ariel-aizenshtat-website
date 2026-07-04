/** עזרי פורמט לתאריכים וגדלים — עברית */

export function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("he-IL", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export function formatDateTime(iso: string): string {
  return new Date(iso).toLocaleString("he-IL", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function timeAgo(iso: string): string {
  const seconds = Math.floor((Date.now() - new Date(iso).getTime()) / 1000);
  if (seconds < 60) return "ממש עכשיו";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `לפני ${minutes} דקות`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return hours === 1 ? "לפני שעה" : `לפני ${hours} שעות`;
  const days = Math.floor(hours / 24);
  if (days < 30) return days === 1 ? "אתמול" : `לפני ${days} ימים`;
  return formatDate(iso);
}

export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

/** חודש "2026-07" → "יולי 2026" */
export function formatMonth(key: string): string {
  const [year, month] = key.split("-").map(Number);
  return new Date(year, month - 1, 1).toLocaleDateString("he-IL", {
    month: "short",
    year: "2-digit",
  });
}
