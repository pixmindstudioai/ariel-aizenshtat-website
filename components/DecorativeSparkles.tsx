import DecorativeAsset from "@/components/DecorativeAsset";
import { decorations } from "@/data/assets";

interface DecorativeSparklesProps {
  /** מיקום הסט הראשי */
  className?: string;
  size?: number;
  variant?: "primary" | "alt";
  delay?: number;
}

/** ברקיות מרחפות — קישוט מוכן למיקום חופשי בתוך container יחסי */
export default function DecorativeSparkles({
  className = "",
  size = 64,
  variant = "primary",
  delay = 0,
}: DecorativeSparklesProps) {
  return (
    <DecorativeAsset
      asset={variant === "primary" ? decorations.sparklesSet : decorations.sparklesAlt}
      size={size}
      delay={delay}
      className={className}
    />
  );
}
