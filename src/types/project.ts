export interface IProjectBugs {
  detected: number;
  fixed: number;
  open: number;
  fixRate: number;
}

export interface IProjectFeatures {
  delivered: number;
  bugRate: number;
}

export interface IProjectOverview {
  bugs: IProjectBugs;
  features: IProjectFeatures;
  period: string;
}

export type SprintStatus = "completed" | "active" | "planned";

export interface ISprint {
  id: number;
  name: string;
  shortName: string;
  storyPointsPlanned: number;
  storyPointsDone: number;
  velocityPercent: number;
  status: SprintStatus;
}

export interface ISprintSummary {
  totalPlanned: number;
  totalDone: number;
  averageVelocityPercent: number;
  trend: "increasing" | "stable" | "declining";
}

export interface IProjectSprintsResponse {
  sprints: ISprint[];
  summary: ISprintSummary;
}
