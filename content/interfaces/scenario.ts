import { LandmarkData } from './landmark';

export interface ScenarioNode {
  name: string;
  icon: string;
  description: string;
  id: number;

  landmark?: string;
  landmarkData?: LandmarkData;
  playerSpawnLocation?: boolean;
  blockMovement?: boolean;
}

export interface ScenarioWorld {
  name: string;
  id: number;
  layout: number[][];
}

export interface Scenario {
  name: string;
  worlds: Record<number, ScenarioWorld>;
  nodes: Record<number, ScenarioNode>;
  hash: string;
}
