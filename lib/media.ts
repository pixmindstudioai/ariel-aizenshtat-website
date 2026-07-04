/**
 * כללי המדיה של האתר — קובץ משותף לקליינט ולשרת.
 * כל הווידאו, האודיו והתמונות נשמרים אך ורק ב-Supabase Storage שלנו
 * (bucket בשם media) — בלי שירותי אחסון חיצוניים כמו יוטיוב או וימאו.
 */

export type MediaKind = "image" | "video" | "audio" | "pdf";

/** mime → סיומת קובץ — רק הסוגים האלה מותרים להעלאה */
export const ALLOWED_MEDIA_TYPES: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/svg+xml": "svg",
  "image/gif": "gif",
  "image/avif": "avif",
  "video/mp4": "mp4",
  "video/webm": "webm",
  "video/quicktime": "mov",
  "audio/mpeg": "mp3",
  "audio/mp4": "m4a",
  "audio/x-m4a": "m4a",
  "audio/wav": "wav",
  "audio/x-wav": "wav",
  "audio/ogg": "ogg",
  "audio/aac": "aac",
  "audio/flac": "flac",
  "application/pdf": "pdf",
};

/** מגבלת גודל לכל סוג מדיה (בבתים) */
export const MEDIA_SIZE_LIMITS: Record<MediaKind, number> = {
  image: 25 * 1024 * 1024, // 25MB
  pdf: 25 * 1024 * 1024, // 25MB
  audio: 100 * 1024 * 1024, // 100MB
  video: 500 * 1024 * 1024, // 500MB
};

export const MEDIA_LIMITS_LABEL = "תמונות עד 25MB · אודיו עד 100MB · וידאו עד 500MB";

/** סוג המדיה לפי ה-mime type */
export function mediaKind(fileType: string): MediaKind {
  if (fileType.startsWith("image/")) return "image";
  if (fileType.startsWith("video/")) return "video";
  if (fileType.startsWith("audio/")) return "audio";
  return "pdf";
}

const VIDEO_EXTENSIONS = ["mp4", "webm", "mov", "m4v"];
const AUDIO_EXTENSIONS = ["mp3", "m4a", "wav", "ogg", "aac", "flac", "weba"];
const PDF_EXTENSIONS = ["pdf"];

/** סוג המדיה לפי סיומת ה-URL — לשיבוץ נכון בעורך התוכן */
export function mediaKindFromUrl(url: string): MediaKind {
  const clean = url.split(/[?#]/)[0].toLowerCase();
  const ext = clean.slice(clean.lastIndexOf(".") + 1);
  if (VIDEO_EXTENSIONS.includes(ext)) return "video";
  if (AUDIO_EXTENSIONS.includes(ext)) return "audio";
  if (PDF_EXTENSIONS.includes(ext)) return "pdf";
  return "image";
}

/** מחרוזת accept ל-input קבצים */
export function mediaAccept(kinds?: MediaKind[]): string {
  const types = Object.keys(ALLOWED_MEDIA_TYPES);
  if (!kinds || kinds.length === 0) return types.join(",");
  return types.filter((t) => kinds.includes(mediaKind(t))).join(",");
}

/**
 * שירותי אחסון/סטרימינג חיצוניים — חסומים.
 * המדיה של האתר חיה אצלנו בלבד.
 */
const EXTERNAL_MEDIA_HOSTS = [
  "youtube.com",
  "youtu.be",
  "youtube-nocookie.com",
  "vimeo.com",
  "dailymotion.com",
  "wistia.com",
  "wistia.net",
  "loom.com",
  "twitch.tv",
  "tiktok.com",
  "facebook.com",
  "fb.watch",
  "instagram.com",
  "streamable.com",
  "soundcloud.com",
  "spotify.com",
  "drive.google.com",
  "dropbox.com",
  "onedrive.live.com",
  "1drv.ms",
];

/** האם הכתובת מצביעה על שירות אחסון/סטרימינג חיצוני */
export function isExternalMediaUrl(url: string): boolean {
  const value = url.trim();
  if (!value || value.startsWith("/")) return false;
  try {
    const host = new URL(value).hostname.toLowerCase().replace(/^www\./, "");
    return EXTERNAL_MEDIA_HOSTS.some((blocked) => host === blocked || host.endsWith(`.${blocked}`));
  } catch {
    return false;
  }
}

/** שם קובץ בטוח לנתיב ב-Storage */
export function sanitizeFileName(name: string): string {
  const dot = name.lastIndexOf(".");
  const base = (dot > 0 ? name.slice(0, dot) : name)
    .toLowerCase()
    .replace(/[^a-z0-9-_]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
  return base || "file";
}
