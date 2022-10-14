import { EquipmentSlot } from './character';
import { IItemConfig, IModifiableItem } from './item';

export interface IBackground {
  name: string;
  icon: string;
  disabled?: boolean;
  realName: string;
  hp: number;
  description: string;
  archetype: string;
  goal: string;
  body: Record<EquipmentSlot, IItemConfig>;
  startingKit: IModifiableItem[];
}
