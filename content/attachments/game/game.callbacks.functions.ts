import { ILandmarkEncounterCallbacks } from '../../interfaces';

let callbacks: ILandmarkEncounterCallbacks;

export function setCallbacks(newCallbacks: ILandmarkEncounterCallbacks) {
  callbacks = newCallbacks;
}

export function getCallbacks() {
  return callbacks;
}
