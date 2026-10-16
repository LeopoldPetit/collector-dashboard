export type KpiStatus = "ok" | "warning" | "critical";

export interface IKpiCard {
  title: string;
  value: string | number;
  unit?: string | null;
  status: KpiStatus;
  trend?: number;
  description?: string;
}

export interface IRequestVolumePoint {
  time: string;
  requests: number;
}

export interface IWeeklyDeployPoint {
  day: string;
  deploys: number;
  failures: number;
}

export interface IActivityItem {
  label: string;
  time: string;
  severity: "ok" | "warning" | "critical" | "info";
}

export interface IDashboardOverview {
  kpis: IKpiCard[];
  requestVolume: IRequestVolumePoint[];
  weeklyDeploys: IWeeklyDeployPoint[];
  recentActivity: IActivityItem[];
}
