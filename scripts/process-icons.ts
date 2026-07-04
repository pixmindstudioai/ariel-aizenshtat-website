/**
 * process-icons.ts
 *
 * עיבוד אייקוני הסטיקר שנוצרו עם gpt-image-2:
 * 1. הסרת הרקע הלבן האחיד (flood fill מהשוליים בלבד — לא פוגע בלבן שבתוך האייקון)
 * 2. חיתוך שוליים + ריפוד
 * 3. התאמה לריבוע 240x240 אחיד
 * 4. שמירה ב-public/assetss/processed/icons
 *
 * הרצה: npx tsx scripts/process-icons.ts <תיקיית-מקור>
 */
import { mkdirSync, readdirSync } from "node:fs";
import path from "node:path";
import sharp from "sharp";

const SRC_DIR = process.argv[2];
if (!SRC_DIR) {
  console.error("שימוש: npx tsx scripts/process-icons.ts <תיקיית-מקור>");
  process.exit(1);
}
const OUT_DIR = path.join(__dirname, "..", "public", "assetss", "processed", "icons");
const SIZE = 240;
const WHITE_TOL = 12; // כמה רחוק מלבן טהור עדיין נחשב רקע
const PAD = 6;

async function processOne(file: string) {
  const { data, info } = await sharp(path.join(SRC_DIR, file))
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });
  const w = info.width;
  const h = info.height;
  const n = w * h;

  const isWhite = (p: number) => {
    const i = p * 4;
    return (
      255 - data[i] <= WHITE_TOL &&
      255 - data[i + 1] <= WHITE_TOL &&
      255 - data[i + 2] <= WHITE_TOL
    );
  };

  // Flood fill מהשוליים על פיקסלים לבנים — הלבן שבתוך הסטיקר (outline) מוגן
  // כי הוא לא מחובר לשוליים דרך פיקסלים לבנים (הצללית מפרידה? לא —
  // ה-outline נוגע ברקע ישירות!). לכן: קודם מזהים את קו המתאר של האובייקט
  // בעזרת סף "לא לבן", מרחיבים אותו, ורק לבן שמחוץ למעטפת נמחק.
  // בפועל: flood מהשוליים, אבל עצירה כשנתקלים בפיקסל שקרוב ללבן אך
  // בתוך אזור עם שכנים צבעוniques אינה אמינה — במקום זה משתמשים במסכת
  // מרחק: פיקסל לבן נמחק רק אם הוא מחובר לשוליים בלי לעבור דרך פיקסל צבעוני.
  const bg = new Uint8Array(n);
  const queue: number[] = [];
  const seed = (x: number, y: number) => {
    const p = y * w + x;
    if (!bg[p] && isWhite(p)) {
      bg[p] = 1;
      queue.push(p);
    }
  };
  for (let x = 0; x < w; x++) {
    seed(x, 0);
    seed(x, h - 1);
  }
  for (let y = 0; y < h; y++) {
    seed(0, y);
    seed(w - 1, y);
  }
  while (queue.length) {
    const p = queue.pop()!;
    const x = p % w;
    const y = (p / w) | 0;
    for (const [nx, ny] of [
      [x - 1, y],
      [x + 1, y],
      [x, y - 1],
      [x, y + 1],
    ]) {
      if (nx < 0 || ny < 0 || nx >= w || ny >= h) continue;
      const np = ny * w + nx;
      if (!bg[np] && isWhite(np)) {
        bg[np] = 1;
        queue.push(np);
      }
    }
  }
  // הערה: קו המתאר הלבן של הסטיקר נוגע ברקע הלבן, ולכן ה-flood עלול
  // "לאכול" אותו. כדי למנוע זאת — מכווצים את מסכת הרקע בפיקסל אחד (erode),
  // כך שנשמרת טבעת לבנה דקה סביב האובייקט, וה-outline נשאר שלם ויזואלית.
  const eroded = new Uint8Array(bg);
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const p = y * w + x;
      if (!bg[p]) continue;
      // פיקסל רקע שגובל בתוכן — מוחזר להיות תוכן (משמר outline)
      const nearContent =
        (x > 0 && !bg[p - 1]) ||
        (x < w - 1 && !bg[p + 1]) ||
        (y > 0 && !bg[p - w]) ||
        (y < h - 1 && !bg[p + w]);
      if (nearContent) eroded[p] = 0;
    }
  }

  let minX = w,
    minY = h,
    maxX = -1,
    maxY = -1;
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const p = y * w + x;
      data[p * 4 + 3] = eroded[p] ? 0 : 255;
      if (!eroded[p]) {
        if (x < minX) minX = x;
        if (x > maxX) maxX = x;
        if (y < minY) minY = y;
        if (y > maxY) maxY = y;
      }
    }
  }
  if (maxX < 0) {
    console.warn(`⚠️  ${file}: ריק — מדלג`);
    return;
  }
  const left = Math.max(0, minX - PAD);
  const top = Math.max(0, minY - PAD);
  const cw = Math.min(w, maxX + PAD + 1) - left;
  const ch = Math.min(h, maxY + PAD + 1) - top;

  await sharp(data, { raw: { width: w, height: h, channels: 4 } })
    .extract({ left, top, width: cw, height: ch })
    .resize(SIZE, SIZE, {
      fit: "contain",
      background: { r: 0, g: 0, b: 0, alpha: 0 },
    })
    .png({ compressionLevel: 9 })
    .toFile(path.join(OUT_DIR, file));

  console.log(`✅ ${file} (${w}x${h} → ${SIZE}x${SIZE})`);
}

async function main() {
  mkdirSync(OUT_DIR, { recursive: true });
  const files = readdirSync(SRC_DIR).filter(
    (f) => f.startsWith("icon-") && f.endsWith(".png")
  );
  for (const f of files) await processOne(f);
  console.log(`\n🎉 ${files.length} אייקונים ב-public/assetss/processed/icons`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
