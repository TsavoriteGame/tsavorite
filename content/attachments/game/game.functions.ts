import { IGame } from '../../interfaces';

export const defaultGame: () => IGame = () => ({
  character: undefined,
  position: { worldId: 0, x: 0, y: 0 },
  scenario: undefined,
  landmarkEncounter: undefined,
  currentStep: 0,
  currentCardId: 0,
  currentEventLog: [],
  version: 1
});
