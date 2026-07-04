import path from "node:path";
import type { NextConfig } from "next";

/** ה-hostname של פרויקט ה-Supabase — לתמונות מ-Storage דרך next/image */
const supabaseHost = process.env.NEXT_PUBLIC_SUPABASE_URL
  ? new URL(process.env.NEXT_PUBLIC_SUPABASE_URL).hostname
  : "*.supabase.co";

const nextConfig: NextConfig = {
  // יש lockfile נוסף בתיקיית הבית — מקבעים את שורש הפרויקט למניעת זיהוי שגוי
  turbopack: {
    root: path.join(__dirname),
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: supabaseHost,
        pathname: "/storage/v1/object/public/**",
      },
    ],
  },
};

export default nextConfig;
