/**
 * אסטים גרפיים של הניוזלטר — מקור: "newsliter assets" (גרסאות שקופות וחתוכות ב-public/assetss/newsletter — רקע הוסר עם rembg/birefnet).
 * משמשים בממשק הניהול (עמוד הניוזלטר) ובאזור ההרשמה באתר הציבורי.
 */
import type { AssetDef } from "@/data/assets";
import type { AdminAsset } from "@/data/adminAssets";

export const newsletterAssets = {
  titleMain: {
    src: "/assetss/newsletter/news-title-main.png",
    width: 1106,
    height: 811,
    alt: "ניוזלטר AI — עדכונים, כלים ותובנות במקום אחד",
  },
  decoFlow: {
    src: "/assetss/newsletter/news-deco-flow.png",
    width: 1032,
    height: 805,
    alt: "קישוט מעטפה, חץ ובועת שיחה",
  },
  btnJoin: {
    src: "/assetss/newsletter/news-btn-join.png",
    width: 1835,
    height: 468,
    alt: "הצטרפו לניוזלטר",
  },
  badgeWeekly: {
    src: "/assetss/newsletter/news-badge-weekly.png",
    width: 1238,
    height: 759,
    alt: "עדכון שבועי",
  },
  cardWhatYouGet: {
    src: "/assetss/newsletter/news-card-what-you-get.png",
    width: 1243,
    height: 970,
    alt: "מה תקבלו בניוזלטר — כלים מעשיים, רעיונות והשראה, תובנות ועדכונים",
  },
  badgeArticles: {
    src: "/assetss/newsletter/news-badge-articles.png",
    width: 1108,
    height: 703,
    alt: "מאמרים נבחרים",
  },
  badgeToolUpdates: {
    src: "/assetss/newsletter/news-badge-tool-updates.png",
    width: 1288,
    height: 870,
    alt: "עדכוני כלים",
  },
  badgeTips: {
    src: "/assetss/newsletter/news-badge-tips.png",
    width: 1339,
    height: 744,
    alt: "טיפים ופרומפטים",
  },
  btnArchive: {
    src: "/assetss/newsletter/news-btn-archive.png",
    width: 1808,
    height: 487,
    alt: "לארכיון הניוזלטרים",
  },
  envelopeOpen: {
    src: "/assetss/newsletter/news-envelope-open.png",
    width: 920,
    height: 806,
    alt: "מעטפה פתוחה עם גיליון ניוזלטר",
  },
  titleNewsTools: {
    src: "/assetss/newsletter/news-title-news-tools.png",
    width: 1108,
    height: 711,
    alt: "חדשות, כלים ועדכונים",
  },
  btnSignup: {
    src: "/assetss/newsletter/news-btn-signup.png",
    width: 1218,
    height: 473,
    alt: "הירשמו עכשיו",
  },
  badgeOnceAWeek: {
    src: "/assetss/newsletter/news-badge-once-a-week.png",
    width: 1097,
    height: 424,
    alt: "פעם בשבוע ישר למייל",
  },
  badgeExclusive: {
    src: "/assetss/newsletter/news-badge-exclusive.png",
    width: 1173,
    height: 753,
    alt: "תוכן בלעדי רק למנויים",
  },
  badgeAiUpdates: {
    src: "/assetss/newsletter/news-badge-ai-updates.png",
    width: 1168,
    height: 646,
    alt: "עדכוני AI — כל מה שחדש באמת",
  },
  btnPastIssues: {
    src: "/assetss/newsletter/news-btn-past-issues.png",
    width: 1169,
    height: 351,
    alt: "לגיליונות קודמים",
  },
  cardWhyJoin: {
    src: "/assetss/newsletter/news-card-why-join.png",
    width: 1133,
    height: 1051,
    alt: "למה להצטרף? עדכונים, פרומפטים וכלים",
  },
  cardLatestIssue: {
    src: "/assetss/newsletter/news-card-latest-issue.png",
    width: 1021,
    height: 825,
    alt: "קראו את הגיליון האחרון",
  },
  envelopeCute: {
    src: "/assetss/newsletter/news-envelope-cute.png",
    width: 994,
    height: 845,
    alt: "מעטפה חמודה עם המסקוטים",
  },
  decoSet: {
    src: "/assetss/newsletter/news-deco-set.png",
    width: 947,
    height: 923,
    alt: "סט קישוטים — מעטפה, לב ובועת שיחה",
  },
} as const satisfies Record<string, AssetDef>;

/**
 * עטיפה בפורמט AdminAsset — לקומפוננטות ממשק הניהול
 * (AdminPageHeader / AdminEmptyState) שמצפות לשדות המלאים.
 */
export const newsletterAdminAssets: Record<keyof typeof newsletterAssets, AdminAsset> =
  Object.fromEntries(
    Object.entries(newsletterAssets).map(([key, def]) => [
      key,
      {
        id: `newsletter-${key}`,
        name: def.alt,
        src: def.src,
        alt: def.alt,
        category: "decorations",
        usage: "עמוד הניוזלטר בממשק הניהול",
        decorative: true,
        priority: false,
        width: def.width,
        height: def.height,
      } satisfies AdminAsset,
    ])
  ) as Record<keyof typeof newsletterAssets, AdminAsset>;

