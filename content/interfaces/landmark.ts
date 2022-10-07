import { Store } from '@ngxs/store';
import { Observable } from 'rxjs';
import { GameConstant } from '../../src/app/core/services/game/game.service';
import { IGameCharacter } from '../../src/app/core/services/game/stores';
import { ICard } from './card';
import { IItemConfig } from './item';
import { IScenario, IScenarioNode } from './scenario';

export interface IMapPosition {
  worldId: number;
  x: number;
  y: number;
}

export interface ILandmarkSlotChoice {
  text: string;
  callback: (landmarkEncounter: ILandmarkEncounter) => Observable<ILandmarkEncounter>;
}

export interface ISlotFunctionOpts {
  encounterOpts: ILandmarkEncounterOpts;
  landmarkEncounter: ILandmarkEncounter;
  slotIndex: number;
  card: ICard;
  store: Store;
  extraOpts: Record<string, any>;
}

export type CardFunction = (opts: ISlotFunctionOpts) => Observable<ILandmarkEncounter>;

export interface ILandmarkSlot {

  // a placeable card slot
  card?: ICard;

  // whether or not to show the card slot
  showCardSlot?: boolean;

  // display a bonus card in the middle for attacks
  selectedAttack?: string;

  // whether or not the slot is accepting items
  locked?: boolean;

  // the text used to describe the slot
  text: string;

  // the icon used for the slot
  icon: string;

  // the timer "type" - defaults to unset/neutral
  timerType?: string;

  // the draggable card types that are accepted by this slot
  accepts: string[];

  // the maximum amount of time that can possibly be on the timer
  // generally set to the same thing as `timer`
  // -1 = infinite
  maxTimer: number;

  // the amount of time the player has to respond to the slot
  // -1 = infinite
  timer: number;

  // whether or not the slot should lock when the timer expires
  lockOnTimerExpire?: boolean;

  // whether or not the timer should be visible when the card is present
  hideTimerWhenCardPresent?: boolean;

  // place a card in the slot
  cardPlaced?: string;
  cardPlacedOpts?: Record<string, any>;

  // place a card in the slot
  timerExpired?: string;
  timerExpiredOpts?: Record<string, any>;

  // extra data associated with the slot
  slotData?: Record<string, any>;
}

export interface ILandmarkData {

  // if the thing can warp, this is where it would store that data
  warpToWorld?: number;
  warpToLandmark?: number;

  // if the thing gives you an item, this is set
  item?: IItemConfig;

  // if the thing sells items, this is set
  shopItems?: Array<{ item: string; cost: number }>;

  // the interval in turns at which the landmark will move
  moveInterval?: number;

  // how many steps it will take at a time if it moves
  moveSteps?: number;

  // the monsters that will be spawned at this landmark
  monsters?: Array<{ name: string }>;
}

export interface ILandmarkEncounterOpts {
  scenario: IScenario;
  position: IMapPosition;
  scenarioNode: IScenarioNode;
  character: IGameCharacter;
  callbacks: {
    content: {
      getConstant: (constant: GameConstant) => any;
      getItemDataById: (id: string) => IItemConfig;
      createItemById: (id: string) => IItemConfig;
    };
    logger: {
      log: (...message) => void;
      error: (...message) => void;
    };
    newEventMessage: (message: string) => void;
  };
}

export interface ILandmark {

  // encounter this landmark
  encounter(encounterOpts: ILandmarkEncounterOpts): Observable<ILandmarkEncounter>;
}

export class Landmark {
  constructor(protected store: Store) {}
}

export interface ILandmarkEncounter {

  // the type of landmark (class name)
  landmarkType: string;

  // the name of the landmark
  landmarkName: string;

  // the description of the landmark
  landmarkDescription: string;

  // the icon used for the landmark
  landmarkIcon: string;

  // the data for the landmark
  landmarkData: Record<string, any>;

  // the slot data for the landmark
  slots: ILandmarkSlot[];

  // the player slot data for the landmark
  playerSlots: ILandmarkSlot[];

  // what kind of choices this landmark has
  choices: ILandmarkSlotChoice[];

  // whether or not you can leave from this location
  canLeave?: boolean;

  // whether or not to disallow health updates for players
  disallowHealthUpdates?: boolean;
}
