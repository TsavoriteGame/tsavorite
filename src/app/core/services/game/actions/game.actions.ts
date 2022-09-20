import { ItemConfig } from '../../../../../../content/interfaces';
import { IGameSetup } from '../stores/gamesetup.store';

export class StartGame {
  static type = '[Game] Start Game';
  constructor(public gameStartData: IGameSetup) {}
}

export class AbandonGame {
  static type = '[Game] Abandon Game';
  constructor() {}
}

export class AddBackpackItem {
  static type = '[Game] Add Backpack Item';
  constructor(public item: ItemConfig) {}
}
