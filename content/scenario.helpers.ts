import { IScenario, IScenarioNode } from './interfaces';

// get the spawn node from a scenario
export function getSpawnNode(scenario: IScenario): IScenarioNode {
  return Object.values(scenario.nodes).find(node => node.playerSpawnLocation);
}

// get node at w,x,y
export function getNodeAt(scenario: IScenario, worldId: number, x: number, y: number): IScenarioNode {
  const world = scenario.worlds[worldId];
  const nodeId = world.layout[y]?.[x] ?? -1;
  return scenario.nodes[nodeId];
}

// get the number of worlds in a scenario
export function scenarioWorldCount(scenario: IScenario): number {
  return Object.keys(scenario.worlds).length;
}

// find the first landmark matching a node id
export function findFirstLandmark(scenario: IScenario, nodeId: number): { worldId: number; x: number; y: number } {
  const numWorlds = scenarioWorldCount(scenario);

  for(let worldId = 0; worldId < numWorlds; worldId++) {
    const world = scenario.worlds[worldId];

    for(let y = 0; y < world.layout.length; y++) {
      for(let x = 0; x < world.layout[y].length; x++) {
        if(world.layout[y][x] === nodeId)
          return { worldId, x, y };
      }
    }
  }

  throw new Error(`Could not find landmark ${nodeId} in scenario ${scenario.name}`);
}

export function findFirstLandmarkInWorld(scenario: IScenario, worldId: number, nodeId: number): { worldId: number; x: number; y: number } {

  const world = scenario.worlds[worldId];

  for(let y = 0; y < world.layout.length; y++) {
    for(let x = 0; x < world.layout[y].length; x++) {
      if(world.layout[y][x] === nodeId)
        return { worldId, x, y };
    }
  }

  throw new Error(`Could not find landmark ${nodeId} in scenario ${scenario.name}:world ${worldId}`);
}

// find the spawn x/y
export function findSpawnCoordinates(scenario: IScenario): { worldId: number; x: number; y: number } {
  const node = getSpawnNode(scenario);

  return findFirstLandmark(scenario, node.id);
}
