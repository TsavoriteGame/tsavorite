
import { IItemConfig } from './item';
import { IPower } from './power';

export enum EquipmentSlot {
  Head = 'head',
  Hands = 'hands',
  Body = 'body',
  Feet = 'feet'
}

export interface ICreature {
  name: string;
  hp: number;
  body: Record<EquipmentSlot, IItemConfig>;
}

export interface ICharacter extends ICreature {
  equipment: {
    [EquipmentSlot.Head]: IItemConfig;
    [EquipmentSlot.Hands]: IItemConfig;
    [EquipmentSlot.Body]: IItemConfig;
    [EquipmentSlot.Feet]: IItemConfig;
  };
  items: IItemConfig[];
  powers: IPower[];
}
