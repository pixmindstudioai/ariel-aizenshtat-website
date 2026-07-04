import Link from "next/link";
import AssetImage from "@/components/AssetImage";
import FloatingSticker from "@/components/FloatingSticker";
import { mascots, decorations } from "@/data/assets";
import DecorativeAsset from "@/components/DecorativeAsset";

export default function NotFound() {
  return (
    <section className="relative mx-auto flex max-w-3xl flex-col items-center gap-6 px-4 py-24 text-center">
      <DecorativeAsset
        asset={decorations.sparklesSet}
        size={64}
        className="absolute right-[12%] top-12 hidden md:block"
      />
      <FloatingSticker duration={5} className="w-40">
        <AssetImage
          asset={mascots.claudeHappy}
          alt="דמות הפיקסלים מצטערת"
          className="w-full h-auto"
        />
      </FloatingSticker>
      <p className="text-7xl font-black text-gradient">404</p>
      <h1 className="text-3xl font-black md:text-4xl">אופס, העמוד הזה התחבא</h1>
      <p className="max-w-md text-lg leading-relaxed text-muted">
        נראה שהקישור שהגעתם אליו כבר לא קיים או שהשתנה. בואו נחזור למקום בטוח —
        או שתציצו בתיק העבודות בדרך.
      </p>
      <div className="mt-2 flex flex-col gap-3 sm:flex-row">
        <Link href="/" className="btn-primary">
          חזרה לעמוד הבית
        </Link>
        <Link href="/portfolio" className="btn-secondary">
          לתיק העבודות
        </Link>
      </div>
    </section>
  );
}
