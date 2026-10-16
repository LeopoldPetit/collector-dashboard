export interface IDevOpsDeployments {
  total: number;
  successful: number;
  failed: number;
  changeFailureRate: number;
  frequencyPerDay: number;
  periodDays: number;
}

export interface IDevOpsLeadTime {
  averageDays: number;
  unit: string;
}

export interface IDevOpsTeam {
  developers: number;
  devops: number;
  productOwner: number;
  cto: number;
}

export interface IDevOpsOverview {
  deployments: IDevOpsDeployments;
  leadTime: IDevOpsLeadTime;
  team: IDevOpsTeam;
}
