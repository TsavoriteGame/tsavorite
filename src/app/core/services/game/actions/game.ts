import { IGameSetup } from '../stores/gamesetup';

export class StartGame {
  static type = '[Game] Start Game';
  constructor(public gameStartData: IGameSetup) {}
}
