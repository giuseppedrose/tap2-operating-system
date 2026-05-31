interface ExecutiveSectionProps {
  title: string;
  subtitle?: string;
  note?: string;
  right?: React.ReactNode;
  children: React.ReactNode;
}

export function ExecutiveSection({ title, subtitle, note, right, children }: ExecutiveSectionProps) {
  return (
    <div className="space-y-3">
      <div className="flex items-end justify-between gap-4 pb-2 border-b border-gray-200">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-gray-400">{title}</p>
          {subtitle && <p className="text-xs text-gray-500 mt-0.5">{subtitle}</p>}
        </div>
        {right && <div className="flex-shrink-0">{right}</div>}
      </div>
      {children}
      {note && (
        <p className="text-[10px] text-gray-400 pt-1 italic">{note}</p>
      )}
    </div>
  );
}
