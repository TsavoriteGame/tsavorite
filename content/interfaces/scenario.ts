
export interface ScenarioNode {
  name: string;
  icon: string;
  id: number;

  landmark?: string;
  playerSpawnLocation?: boolean;
  blockMovement?: boolean;
  warpToWorld?: number;
  warpToLandmark?: number;
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
}
