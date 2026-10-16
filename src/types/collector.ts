export type CollectorCategory =
  | "quality"
  | "security"
  | "tests"
  | "performance";

export type CollectorStatus = "ok" | "warning" | "critical" | "info";

export interface ICollectorMetric {
  category: CollectorCategory;
  name: string;
  value: number;
  unit: string;
  status: CollectorStatus;
  recordedAt: string;
  commitSha: string | null;
}

export interface ICollectorService {
  service: string;
  metrics: ICollectorMetric[];
}

export interface ICollectorOverview {
  generatedAt: string;
  services: ICollectorService[];
}

export interface ICollectorHistoryPoint {
  recordedAt: string;
  value: number;
}

export interface ICollectorHistory {
  service: string;
  name: string;
  points: ICollectorHistoryPoint[];
}
