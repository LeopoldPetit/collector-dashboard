export interface IBusinessRevenue {
  total: number;
  currency: string;
  period: string;
}

export interface IBusinessArpu {
  value: number;
  currency: string;
}

export interface IBusinessConversions {
  visitors: number;
  newSubscriptions: number;
  conversionRate: number;
}

export interface IBusinessChurn {
  churnedUsers: number;
  churnRate: number;
  retentionRate: number;
}

export interface IBusinessOverview {
  revenue: IBusinessRevenue;
  arpu: IBusinessArpu;
  subscriptionPrice: number;
  conversions: IBusinessConversions;
  churn: IBusinessChurn;
}

export interface IBusinessUserEvolutionPoint {
  label: string;
  value: number;
}

export interface IBusinessUsers {
  users: {
    total: number;
    activeMonthly: number;
    startOfMonth: number;
    endOfMonth: number;
    newThisMonth: number;
    churnedThisMonth: number;
  };
  evolution: IBusinessUserEvolutionPoint[];
}
