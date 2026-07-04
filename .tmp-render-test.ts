import { renderNewsletterEmail } from "./lib/newsletter/render";

const html = renderNewsletterEmail({
  subject: "5 כלים חדשים <script>alert(1)</script>",
  preheader: "מה חדש השבוע",
  content: `## שלום לכולם

זה הגיליון הראשון! [קישור לאתר](/portfolio) וגם [חיצוני](https://example.com)

- כלי ראשון
- כלי שני

![תמונה](/assetss/newsletter/news-envelope-cute.png)

@video(https://www.youtube.com/watch?v=abc123)`,
  siteName: "Ariel AI",
  siteUrl: "https://arielai.co.il",
  unsubscribeUrl: "https://arielai.co.il/newsletter/unsubscribe?token=xyz",
});

const checks: [string, boolean][] = [
  ["dir=rtl", html.includes('dir="rtl"')],
  ["escaped script", !html.includes("<script>") && html.includes("&lt;script&gt;")],
  ["h2 rendered", html.includes("<h2")],
  ["list rendered", html.includes("<li")],
  ["relative link absolutized", html.includes('href="https://arielai.co.il/portfolio"')],
  ["external link", html.includes('href="https://example.com"')],
  ["image absolutized", html.includes('src="https://arielai.co.il/assetss/newsletter/news-envelope-cute.png"')],
  ["video button", html.includes("לצפייה בסרטון")],
  ["unsubscribe link", html.includes("newsletter/unsubscribe?token=xyz")],
  ["preheader", html.includes("מה חדש השבוע")],
];
let failed = 0;
for (const [name, ok] of checks) {
  console.log(`${ok ? "PASS" : "FAIL"} ${name}`);
  if (!ok) failed++;
}
process.exit(failed ? 1 : 0);
