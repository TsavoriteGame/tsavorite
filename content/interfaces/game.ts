import { IArchetype } from './archetype';
import { IBackground } from './background';
import { ICharacter } from './character';
import { ILandmarkEncounter, IMapPosition } from './landmark';
import { IScenario, IScenarioNode } from './scenario';


export interface IGameCharacter extends ICharacter {
  background: IBackground;
  archetype: IArchetype;

  stuck: boolean;
  disallowHealthUpdates: boolean;
  chosenAttack: string;
}

export interface IGame {
  character: IGameCharacter;
  position: IMapPosition;
  scenario: IScenario;
  landmarkEncounter: ILandmarkEncounter;
  currentCardId: number;
  currentStep: number;
  currentEventLog: string[];
  version: number;
}

export interface IMapDisplayInfo {
  scenario: IScenario;
  position: IMapPosition;
  map: IScenarioNode[][];
  character: IGameCharacter;
  currentNode: IScenarioNode;
}

export enum GameConstant {
  BackpackSize = 'backpackSize',
  PlayerSlots = 'playerSlots',
  LandmarkSlots = 'landmarkSlots',
}
