export type MappingConfidence = 'exact' | 'likely' | 'possible' | 'missing' | 'not_applicable';

export interface FieldMapping {
  source: string;
  object_type: string;
  source_field: string;
  source_label?: string;
  tap2_field: string;
  tap2_table?: string;
  confidence: MappingConfidence;
  notes?: string;
  action?: 'use_as_is' | 'transform' | 'create_in_source' | 'skip';
}

export interface FieldProfile {
  name: string;
  label?: string;
  type: string;
  population_rate: number;   // 0-100: % of records with non-null value
  is_custom: boolean;
  sample_values?: (string | number | null)[];
  description?: string;
}

export interface ObjectProfile {
  source: string;
  object_type: string;
  record_count: number;
  fields: FieldProfile[];
  quality_score: number;
  mappings: FieldMapping[];
  missing_for_tap2: string[];
  recommendations: string[];
}

export interface SourceProfile {
  source: string;
  status: 'connected' | 'missing_credentials' | 'error' | 'not_configured';
  error_message?: string;
  last_run?: string;
  objects: ObjectProfile[];
  summary_recommendations: string[];
}

export interface DiscoveryResult {
  source: string;
  sync_run_id?: string;
  status: 'ok' | 'error' | 'no_credentials';
  message: string;
  records_fetched: number;
  profile?: Partial<SourceProfile>;
  raw_sample?: Record<string, unknown>[];
}
