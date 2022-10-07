import { IItemConfig } from '../../../../../../../content/interfaces';
import { EquipmentSlot } from '../../stores';


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
