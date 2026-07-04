/**
 * remove-background-assets.ts
 *
 * קובצי המקור בתיקיית assetss כבר עם רקע שקוף (הוסרו ידנית).
 * הסקריפט הזה:
 * 1. ממפה כל קובץ לשם נקי ומשמעותי (kebab-case, בלי רווחים ועברית ב-URL)
 * 2. חותך שוליים שקופים מיותרים (עם ריפוד קטן) כדי שהאסטים יישבו מדויק בפריסה
 * 3. שומר את התוצאה ב-public/assetss/processed — התיקייה היחידה שהאתר צורך
 *
 * הרצה: npx tsx scripts/remove-background-assets.ts
 */
import { mkdirSync, existsSync } from "node:fs";
import path from "node:path";
import sharp from "sharp";

const ROOT = path.join(__dirname, "..");
const SRC_DIR = path.join(ROOT, "assetss");
const OUT_DIR = path.join(ROOT, "public", "assetss", "processed");

const SUFFIX = " - נערך"; // סיומת שנוספה לקבצים בעריכה הידנית
const TRIM_PAD = 12; // ריפוד שקוף שנשאר סביב התוכן אחרי חיתוך

/** מיפוי קובצי המקור (שמות ChatGPT גנריים) לשמות נקיים ומשמעותיים */
const FILE_MAP: Record<string, string> = {
  "ChatGPT Image Jul 3, 2026, 04_30_01 PM (1)": "hero-title-main.png",
  "ChatGPT Image Jul 3, 2026, 04_30_01 PM (2)": "mascot-claude.png",
  "ChatGPT Image Jul 3, 2026, 04_30_01 PM (3)": "mascot-claude-flat.png",
  "ChatGPT Image Jul 3, 2026, 04_30_02 PM (4)": "mascot-claude-happy.png",
  "ChatGPT Image Jul 3, 2026, 04_30_02 PM (5)": "mascot-codex-cloud.png",
  "ChatGPT Image Jul 3, 2026, 04_30_02 PM (6)": "mascot-openclaw.png",
  "ChatGPT Image Jul 3, 2026, 04_30_03 PM (10)": "card-about.png",
  "ChatGPT Image Jul 3, 2026, 04_30_03 PM (7)": "card-portfolio.png",
  "ChatGPT Image Jul 3, 2026, 04_30_03 PM (8)": "card-written-guides.png",
  "ChatGPT Image Jul 3, 2026, 04_30_03 PM (9)": "card-video-guides.png",
  "ChatGPT Image Jul 3, 2026, 04_30_33 PM (1)": "btn-view-portfolio.png",
  "ChatGPT Image Jul 3, 2026, 04_30_33 PM (2)": "btn-lets-talk.png",
  "ChatGPT Image Jul 3, 2026, 04_30_33 PM (3)": "badge-websites.png",
  "ChatGPT Image Jul 3, 2026, 04_30_34 PM (4)": "badge-ai.png",
  "ChatGPT Image Jul 3, 2026, 04_30_34 PM (5)": "badge-automation.png",
  "ChatGPT Image Jul 3, 2026, 04_30_34 PM (6)": "deco-curved-arrow.png",
  "ChatGPT Image Jul 3, 2026, 04_30_35 PM (10)": "card-browser-window.png",
  "ChatGPT Image Jul 3, 2026, 04_30_35 PM (7)": "deco-sparkles.png",
  "ChatGPT Image Jul 3, 2026, 04_30_35 PM (8)": "deco-heart.png",
  "ChatGPT Image Jul 3, 2026, 04_30_35 PM (9)": "card-code-editor.png",
  "ChatGPT Image Jul 3, 2026, 04_33_03 PM (1)": "btn-build-something.png",
  "ChatGPT Image Jul 3, 2026, 04_33_03 PM (2)": "btn-learn-more.png",
  "ChatGPT Image Jul 3, 2026, 04_33_03 PM (3)": "card-selected-projects.png",
  "ChatGPT Image Jul 3, 2026, 04_33_04 PM (4)": "card-what-you-get.png",
  "ChatGPT Image Jul 3, 2026, 04_33_04 PM (5)": "card-faq.png",
  "ChatGPT Image Jul 3, 2026, 04_33_04 PM (6)": "card-happy-clients.png",
  "ChatGPT Image Jul 3, 2026, 04_33_04 PM (7)": "deco-sparkles-alt.png",
  "ChatGPT Image Jul 3, 2026, 04_33_04 PM (8)": "deco-curved-arrow-left.png",
  "ChatGPT Image Jul 3, 2026, 04_33_05 PM (10)": "btn-send-message.png",
  "ChatGPT Image Jul 3, 2026, 04_33_05 PM (9)": "badge-new.png",
};

async function processOne(srcBase: string, outName: string) {
  const srcPath = path.join(SRC_DIR, `${srcBase}${SUFFIX}.png`);
  const { data, info } = await sharp(srcPath)
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });
  const w = info.width;
  const h = info.height;

  // bounding box של הפיקסלים הלא-שקופים
  let minX = w,
    minY = h,
    maxX = -1,
    maxY = -1;
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      if (data[(y * w + x) * 4 + 3] > 8) {
        if (x < minX) minX = x;
        if (x > maxX) maxX = x;
        if (y < minY) minY = y;
        if (y > maxY) maxY = y;
      }
    }
  }
  if (maxX < 0) {
    console.warn(`⚠️  ${srcBase}: תמונה שקופה לחלוטין — מדלג`);
    return;
  }
  const left = Math.max(0, minX - TRIM_PAD);
  const top = Math.max(0, minY - TRIM_PAD);
  const cw = Math.min(w, maxX + TRIM_PAD + 1) - left;
  const ch = Math.min(h, maxY + TRIM_PAD + 1) - top;

  await sharp(srcPath)
    .ensureAlpha()
    .extract({ left, top, width: cw, height: ch })
    .png({ compressionLevel: 9 })
    .toFile(path.join(OUT_DIR, outName));

  console.log(`✅ ${outName}  (${w}x${h} → ${cw}x${ch})`);
}

async function main() {
  mkdirSync(OUT_DIR, { recursive: true });
  for (const [srcBase, out] of Object.entries(FILE_MAP)) {
    if (!existsSync(path.join(SRC_DIR, `${srcBase}${SUFFIX}.png`))) {
      console.warn(`⚠️  חסר קובץ מקור: ${srcBase}${SUFFIX}.png`);
      continue;
    }
    await processOne(srcBase, out);
  }
  console.log("\n🎉 הסתיים. הגרסאות השקופות ב-public/assetss/processed");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
