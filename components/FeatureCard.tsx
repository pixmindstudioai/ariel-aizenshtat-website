import Link from "next/link";
import StickerCard from "@/components/StickerCard";
import AssetImage from "@/components/AssetImage";
import type { AssetDef } from "@/data/assets";
import type { Service } from "@/data/services";

const accentStyles: Record<Service["accent"], { chip: string; ring: string }> = {
  blue: { chip: "bg-blue/10 text-blue", ring: "group-hover:ring-blue/30" },
  purple: { chip: "bg-purple/10 text-purple", ring: "group-hover:ring-purple/30" },
  pink: { chip: "bg-pink/15 text-pink", ring: "group-hover:ring-pink/30" },
  coral: { chip: "bg-coral/15 text-coral", ring: "group-hover:ring-coral/30" },
};

interface FeatureCardProps {
  service: Service;
  /** אסט גרפי לראש הכרטיס */
  asset?: AssetDef;
  /** האסט מכיל את שם השירות בטקסט — נסתיר את הכותרת ויזואלית */
  assetHasTitle?: boolean;
}

/** כרטיס שירות גדול לאזור "מה אני עושה" */
export default function FeatureCard({
  service,
  asset,
  assetHasTitle = false,
}: FeatureCardProps) {
  const accent = accentStyles[service.accent];
  return (
    <StickerCard className={`group h-full ring-2 ring-transparent transition-shadow ${accent.ring}`}>
      <Link
        href={service.href}
        className="flex h-full flex-col gap-4 p-7 md:p-8 rounded-[2rem] focus-visible:outline-3 focus-visible:outline-blue"
      >
        {asset && (
          <div className="w-52 max-w-full self-center md:self-start">
            <AssetImage
              asset={asset}
              decorative={!assetHasTitle}
              variant="sticker-sm"
              className="w-full h-auto transition-transform duration-300 group-hover:scale-[1.04]"
            />
          </div>
        )}
        <h3 className={assetHasTitle ? "sr-only-visual" : "text-2xl font-extrabold"}>
          {service.title}
        </h3>
        <p className="leading-relaxed text-muted">{service.description}</p>
        <ul className="mt-auto flex flex-wrap gap-2 pt-2">
          {service.bullets.map((b) => (
            <li
              key={b}
              className={`rounded-full px-3 py-1 text-sm font-semibold ${accent.chip}`}
            >
              {b}
            </li>
          ))}
        </ul>
        <span className="mt-2 inline-flex items-center gap-1.5 font-bold text-blue">
          למדו עוד
          <span aria-hidden className="transition-transform group-hover:-translate-x-1">
            ←
          </span>
        </span>
      </Link>
    </StickerCard>
  );
}
