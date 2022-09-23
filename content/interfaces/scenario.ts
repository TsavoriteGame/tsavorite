
export interface ScenarioNode {
  name: string;
  icon: string;

  landmark?: string;
  playerSpawnLocation?: boolean;
  blockMovement?: boolean;
  warpToWorld?: number;
  warpToLandmark?: number;
}

export interface ScenarioWorld {
  name: string;
  layout: number[][];
}

export interface Scenario {
  name: string;
  worlds: Record<number, ScenarioWorld>;
  nodes: Record<number, ScenarioNode>;
}
