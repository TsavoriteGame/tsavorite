

export enum GameStatistic {
  StepsTaken = 'stepsTaken',
}

export interface IGameStatistics {
  version: number;
  statistics: Record<GameStatistic, number>;
};
