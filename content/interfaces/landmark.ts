import { Descriptor, Interaction } from './item';

export interface LandmarkSlot {

  // the icon used for the slot
  readonly icon: string;

  // the amount of time the player has to respond to the slot
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

export interface Landmark {

  // whether or not the landmark can be escaped from
  readonly canCancel: boolean;
}

export interface LandmarkEncounter {

  // the name of the landmark
  readonly landmarkName: string;

  // the type of the landmark
  readonly landmarkType: string;

  // the slot data for the landmark
  slots: LandmarkSlot[];

  // whether or not the landmark has been encountered
  hasBeenEncountered: boolean;
}
