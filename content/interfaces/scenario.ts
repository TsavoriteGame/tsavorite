import { ILandmarkData } from './landmark';

export interface IScenarioNode {
  name: string;
  icon: string;
  description: string;
  id: number;

  landmark: string;
  landmarkData: ILandmarkData;
  playerSpawnLocation?: boolean;
  blockMovement?: boolean;
}

export interface IScenarioWorld {
  name: string;
  id: number;
  layout: Partial<IScenarioNode>[][];
}

export interface IScenario {
  name: string;
  worlds: Record<number, IScenarioWorld>;
  nodes: Record<number, IScenarioNode>;
  hash: string;
}
