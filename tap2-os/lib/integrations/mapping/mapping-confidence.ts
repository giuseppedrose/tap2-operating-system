import type { MappingConfidence, FieldMapping } from './types';

export const CONFIDENCE_CONFIG: Record<MappingConfidence, {
  label: string;
  color: string;
  bg: string;
  border: string;
  description: string;
}> = {
  exact: {
    label: 'Exact Match',
    color: 'text-emerald-700',
    bg: 'bg-emerald-50',
    border: 'border-emerald-200',
    description: 'Field name and type match perfectly — use directly.',
  },
  likely: {
    label: 'Likely Match',
    color: 'text-blue-700',
    bg: 'bg-blue-50',
    border: 'border-blue-200',
    description: 'Field meaning matches — minor transformation may be needed.',
  },
  possible: {
    label: 'Possible Match',
    color: 'text-amber-700',
    bg: 'bg-amber-50',
    border: 'border-amber-200',
    description: 'Partial match — verify before using.',
  },
  missing: {
    label: 'Missing',
    color: 'text-red-600',
    bg: 'bg-red-50',
    border: 'border-red-200',
    description: 'Field does not exist in source — must be created.',
  },
  not_applicable: {
    label: 'N/A',
    color: 'text-gray-400',
    bg: 'bg-gray-50',
    border: 'border-gray-200',
    description: 'Field is not relevant for this source.',
  },
};

export function confidenceScore(mappings: FieldMapping[]): number {
  if (!mappings.length) return 0;
  const weights: Record<MappingConfidence, number> = {
    exact: 100, likely: 75, possible: 40, missing: 0, not_applicable: 60,
  };
  const total = mappings.reduce((s, m) => s + weights[m.confidence], 0);
  return Math.round(total / mappings.length);
}
