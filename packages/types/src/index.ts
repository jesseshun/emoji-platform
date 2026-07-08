export type Locale = 'zh' | 'en';

export interface ApiResponse<T = unknown> {
  success: boolean;
  data: T;
  message?: string;
}

export interface HealthStatus {
  status: string;
  service: string;
}

export interface StatusInfo extends HealthStatus {
  phase: string;
  database?: string;
}
