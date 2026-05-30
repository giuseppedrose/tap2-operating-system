import { Lightbulb } from "lucide-react";

interface ExecutiveInsightProps {
  insight: string;
  nextStep?: string;
}

export function ExecutiveInsight({ insight, nextStep }: ExecutiveInsightProps) {
  return (
    <div className="flex items-start gap-3 rounded-xl border border-blue-100 bg-blue-50/60 px-4 py-3">
      <Lightbulb className="mt-0.5 h-4 w-4 flex-shrink-0 text-blue-500" />
      <div className="min-w-0">
        <p className="text-sm text-blue-800 leading-relaxed">{insight}</p>
        {nextStep && (
          <p className="mt-1 text-xs font-medium text-blue-600">
            Next step: {nextStep}
          </p>
        )}
      </div>
    </div>
  );
}
