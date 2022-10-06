import { ICard, IItemConfig, IMapPosition, IScenario, IScenarioNode } from '../../../../../../content/interfaces';
import { EquipmentSlot } from '../stores';
import { IGameSetup } from '../stores/gamesetup.store';

export class PageLoad {
  static type = '[Options] Page Load';
  constructor() {}
}

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

export class RemoveCharacterItemById {
  static type = '[Game] Remove Character Item By Id';
  constructor(public cardId: number) {}
}

export class UpdateCharacterItemById {
  static type = '[Game] Update Character Item By Id';
  constructor(public cardId: number, public item: IItemConfig) {}
}

export class SetCharacterItemLockById {
  static type = '[Game] Set Character Item Lock By Id';
  constructor(public cardId: number, public locked: boolean) {}
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

export class AddCoinsToBackpack {
  static type = '[Game] Add Coins To Backpack';
  constructor(public amount: number) {}
}

export class RemoveCoinsFromBackpack {
  static type = '[Game] Remove Coins From Backpack';
  constructor(public amount: number) {
    this.amount = -amount;
  }
}

export class SetEquipmentItem {
  static type = '[Game] Set Equipment Item';
  constructor(public item: IItemConfig, public slot: EquipmentSlot) {}
}

export class AddCardToSlot {
  static type = '[Game] Add Card To Slot';
  constructor(public slot: number, public card: ICard) {}
}

export class RemoveCardFromSlot {
  static type = '[Game] Remove Card From Slot';
  constructor(public slot: number) {}
}

export class LandmarkSlotTimerExpire {
  static type = '[Game] Landmark Slot Timer Expire';
  constructor(public slot: number) {}
}

export class SetLandmarkSlotLock {
  static type = '[Game] Set Landmark Slot Lock';
  constructor(public slot: number, public isLocked: boolean) {}
}

export class SetLandmarkSlotTimer {
  static type = '[Game] Set Landmark Slot Timer';
  constructor(public slot: number, public timer: number, public resetMaxTimer = false) {}
}

export class SetLandmarkSlotAttack {
  static type = '[Game] Set Landmark Slot Lock';
  constructor(public slot: number, public attack: string) {}
}

export class PlayerSlotTimerExpire {
  static type = '[Game] Player Slot Timer Expire';
  constructor(public slot: number) {}
}

export class SetPlayerSlotLock {
  static type = '[Game] Set Player Slot Lock';
  constructor(public slot: number, public isLocked: boolean) {}
}

export class SetPlayerSlotTimer {
  static type = '[Game] Set Player Slot Timer';
  constructor(public slot: number, public timer: number, public resetMaxTimer = false) {}
}

export class SetPlayerSlotAttack {
  static type = '[Game] Set Player Slot Timer';
  constructor(public slot: number, public attack: string) {}
}

export class ReplaceNode {
  static type = '[Game] Replace Node';
  constructor(public position: IMapPosition, public newNode: IScenarioNode) {}
}

export class ChangeAttack {
  static type = '[Game] Change Attack';
  constructor(public attack: string) {}
}
