import Reveal from "@/components/Reveal";

interface EmptyStateProps {
  title: string;
  subtitle?: string;
}

/** מצב ריק לרשימות תוכן — מוצג כשאין עדיין פריטים מפורסמים בממשק הניהול */
export default function EmptyState({ title, subtitle }: EmptyStateProps) {
  return (
    <Reveal>
      <div className="card-soft mx-auto max-w-xl px-8 py-12 text-center">
        <p className="text-xl font-extrabold">{title}</p>
        {subtitle && (
          <p className="mt-3 leading-relaxed text-muted">{subtitle}</p>
        )}
      </div>
    </Reveal>
  );
}
