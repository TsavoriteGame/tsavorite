import { ItemConfig, Scenario } from '../../../../../../content/interfaces';
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

export class RemoveBackpackItem {
  static type = '[Game] Remove Backpack Item';
  constructor(public index: number) {}
}

export class UpdateBackpackItem {
  static type = '[Game] Update Backpack Item';
  constructor(public index: number, public item: ItemConfig) {}
}

export class AddHealth {
  static type = '[Game] Add Health';
  constructor(public amount: number) {}
}

export class ReduceHealth {
  static type = '[Game] Reduce Health';
  constructor(public amount: number) {
    this.amount = -amount;
  }
}

export class Move {
  static type = '[Game] Move';
  constructor(public xDelta: number, public yDelta: number) {}
}

export class Warp {
  static type = '[Game] Warp';
  constructor(public scenario: Scenario, public warpToWorld: number, public warpToLandmark: number) {}
}

export class MakeChoice {
  static type = '[Game] Make Choice';
  constructor(public choice: number) {}
}
