import { ICard, IItemConfig, IMapPosition, IScenario, IScenarioNode } from '../../../../../../content/interfaces';
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
  constructor(public item: IItemConfig) {}
}

export class RemoveBackpackItem {
  static type = '[Game] Remove Backpack Item';
  constructor(public index: number) {}
}

export class UpdateBackpackItem {
  static type = '[Game] Update Backpack Item';
  constructor(public index: number, public item: IItemConfig) {}
}

export class RemoveBackpackItemById {
  static type = '[Game] Remove Backpack Item By Id';
  constructor(public cardId: number) {}
}

export class UpdateBackpackItemById {
  static type = '[Game] Update Backpack Item By Id';
  constructor(public cardId: number, public item: IItemConfig) {}
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

export class SetCurrentCardId {
  static type = '[Game] Set Current Card Id';
  constructor(public cardId: number) {}
}

export class Move {
  static type = '[Game] Move';
  constructor(public xDelta: number, public yDelta: number) {}
}

export class EncounterCurrentTile extends Move {
  static type = '[Game] Encounter Current Tile';
  constructor() {
    super(0, 0);
  }
}

export class Warp {
  static type = '[Game] Warp';
  constructor(public scenario: IScenario, public warpToWorld: number, public warpToLandmark: number) {}
}

export class UpdateEventMessage {
  static type = '[Game] Update Event Message';
  constructor(public message: string) {}
}

export class MakeChoice {
  static type = '[Game] Make Choice';
  constructor(public choice: number) {}
}

export class AddCardToSlot {
  static type = '[Game] Add Card To Slot';
  constructor(public slot: number, public card: ICard) {}
}

export class SlotTimerExpire {
  static type = '[Game] Slot Timer Expire';
  constructor(public slot: number) {}
}

export class SetLandmarkSlotLock {
  static type = '[Game] Set Landmark Slot Lock';
  constructor(public slot: number, public isLocked: boolean) {}
}

export class SetLandmarkSlotTimer {
  static type = '[Game] Set Landmark Slot Timer';
  constructor(public slot: number, public timer: number) {}
}

export class ReplaceNode {
  static type = '[Game] Replace Node';
  constructor(public position: IMapPosition, public newNode: IScenarioNode) {}
}
