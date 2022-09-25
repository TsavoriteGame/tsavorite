import { Store } from '@ngxs/store';
import { Observable } from 'rxjs';
import { Descriptor, Interaction } from './item';
import { IScenario, IScenarioNode } from './scenario';

export interface LandmarkSlotChoice {
  text: string;
  callback: (landmarkEncounter: ILandmarkEncounter) => Observable<ILandmarkEncounter>;
}

export interface ILandmarkSlot {

  // the icon used for the slot
  readonly icon: string;

  // the amount of time the player has to respond to the slot
  // -1 = infinite
  readonly timer: number;

  // whether or not the slot should accept cards
  readonly shouldAcceptCards: boolean;

  // what kinds of descriptors the slot should accept
  // undefined = any
  readonly acceptsDescriptor?: Descriptor;

  // what kind of interactions the slot should accept
  // undefined = any
  readonly acceptsInteraction?: Interaction;
}

export interface ILandmarkData {

  // if the thing can warp, this is where it would store that data
  warpToWorld?: number;
  warpToLandmark?: number;
}

export interface ILandmark {

  // whether or not the landmark can be escaped from
  readonly canLeave: boolean;

  // encounter this landmark
  encounter(scenario: IScenario, scenarioNode: IScenarioNode): Observable<ILandmarkEncounter>;
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
  readonly choices: LandmarkSlotChoice[];
}
