export interface ITechnicalOverview {
  totalRequests: number;
  errorRequests: number;
  errorRate: number;
  uptime: {
    totalHours: number;
    downtimeHours: number;
    uptimePercent: number;
  };
  mttr: {
    averageHours: number;
    unit: string;
  };
  responseTimes: {
    average: number;
    p95: number;
    unit: string;
  };
}

export interface ITechnicalIncident {
  id: number;
  title: string;
  durationHours: number;
  durationMinutes: number;
  severity: "low" | "medium" | "high" | "critical";
  status: "resolved" | "open" | "in_progress";
}

export interface ITechnicalIncidentsResponse {
  incidents: ITechnicalIncident[];
  summary: {
    total: number;
    totalDowntimeHours: number;
    mttrHours: number;
    periodDays: number;
  };
}

export interface IResponseTimeSample {
  index: number;
  ms: number;
}

export interface IResponseTimesResponse {
  samples: IResponseTimeSample[];
  stats: {
    min: number;
    max: number;
    average: number;
    p50: number;
    p90: number;
    p95: number;
    unit: string;
  };
}
