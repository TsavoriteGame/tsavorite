import { Store } from '@ngxs/store';
import { Observable } from 'rxjs';
import { IGameCharacter } from '../../src/app/core/services/game/stores';
import { ICard } from './card';
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

export type CardPlaceFunction = (encounterOpts: ILandmarkEncounter, slotIndex: number, card: ICard) => Observable<ILandmarkEncounter>;

export type CardTimerFunction = (encounterOpts: ILandmarkEncounter, slotIndex: number) => Observable<ILandmarkEncounter>;

export interface ILandmarkSlot {

  card: ICard;

  // whether or not the slot is accepting items
  locked?: boolean;

  // the text used to describe the slot
  readonly text: string;

  // the icon used for the slot
  readonly icon: string;

  // the timer "type" - defaults to unset/neutral
  readonly timerType?: string;

  // the maximum amount of time that can possibly be on the timer
  // generally set to the same thing as `timer`
  // -1 = infinite
  readonly maxTimer: number;

  // the amount of time the player has to respond to the slot
  // -1 = infinite
  readonly timer: number;

  // whether or not the slot should lock when the timer expires
  readonly lockOnTimerExpire?: boolean;

  // place a card in the slot
  cardPlaced: CardPlaceFunction;

  // place a card in the slot
  timerExpired: CardTimerFunction;
}

export interface ILandmarkData {

  // if the thing can warp, this is where it would store that data
  warpToWorld?: number;
  warpToLandmark?: number;
}

export interface ILandmarkEncounterOpts {
  scenario: IScenario;
  position: IMapPosition;
  scenarioNode: IScenarioNode;
  character: IGameCharacter;
  callbacks: {
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

  // the name of the landmark
  readonly landmarkName: string;

  // the description of the landmark
  readonly landmarkDescription: string;

  // the icon used for the landmark
  readonly landmarkIcon: string;

  // the data for the landmark
  readonly landmarkData: Record<string, any>;

  // the slot data for the landmark
  readonly slots: ILandmarkSlot[];

  // whether or not the landmark should be removed
  readonly removeAfterEncounter: boolean;

  // what kind of choices this landmark has
  readonly choices: ILandmarkSlotChoice[];

  // whether or not you can leave from this location
  readonly canLeave: boolean;
}
