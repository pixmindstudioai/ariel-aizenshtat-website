import CategoryTabs from "@/components/CategoryTabs";
import { icons } from "@/data/assets";
import { categoryLabels, type ProjectCategory } from "@/data/projects";

interface PortfolioTabsProps {
  /** שמות הקטגוריות מהדאטהבייס (מסך הקטגוריות באדמין) — ברירת מחדל: התוויות הסטטיות */
  labels?: Record<ProjectCategory, string>;
}

/** טאבי הקטגוריות של תיק העבודות — משותפים לכל עמודי הפורטפוליו */
export default function PortfolioTabs({ labels = categoryLabels }: PortfolioTabsProps) {
  const tabs = [
    { href: "/portfolio", label: "הכל", icon: icons.briefcase },
    { href: "/portfolio/video", label: labels.video, icon: icons.videoEdit },
    { href: "/portfolio/websites", label: labels.websites, icon: icons.browserPages },
    { href: "/portfolio/automation", label: labels.automation, icon: icons.automation },
  ];
  return <CategoryTabs tabs={tabs} />;
}
