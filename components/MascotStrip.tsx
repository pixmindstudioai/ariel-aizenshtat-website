import AssetImage from "@/components/AssetImage";
import FloatingSticker from "@/components/FloatingSticker";
import { mascots } from "@/data/assets";

/**
 * שורת המסקוטים — "הצוות": שלושת סוכני ה-AI שאיתי בכל פרויקט.
 * הסדר ב-RTL: הראשון ברשימה מוצג הכי ימני.
 */
const team = [
  {
    asset: mascots.codexCloud,
    name: "Codex",
    role: "סוכן הקוד של OpenAI — חי בטרמינל, מבצע משימות קוד שלמות לבד",
    shortRole: "סוכן הקוד בטרמינל",
    duration: 5,
  },
  {
    asset: mascots.claudeMain,
    name: "Claude Code",
    role: "הסוכן הקודד של Anthropic — בונה איתי אתרים ופרויקטים שלמים",
    shortRole: "הסוכן הקודד",
    duration: 5.8,
  },
  {
    asset: mascots.openclawCloud,
    name: "OpenClaw",
    role: "עוזר AI אישי בקוד פתוח — מריץ אוטומציות בוואטסאפ ובכל ערוץ",
    shortRole: "העוזר האישי בקוד פתוח",
    duration: 6.4,
  },
];

export default function MascotStrip() {
  return (
    <div className="flex flex-wrap items-end justify-center gap-8 md:gap-14">
      {team.map((member, i) => (
        <FloatingSticker key={member.name} duration={member.duration} delay={i * 0.4}>
          <figure className="flex max-w-[13rem] flex-col items-center gap-3">
            <div className="w-24 md:w-32">
              <AssetImage
                asset={member.asset}
                alt={`${member.name} — ${member.shortRole}`}
                className="w-full h-auto"
              />
            </div>
            <figcaption className="text-center">
              <div className="font-extrabold">{member.name}</div>
              <div className="text-sm leading-snug text-muted">{member.role}</div>
            </figcaption>
          </figure>
        </FloatingSticker>
      ))}
    </div>
  );
}
