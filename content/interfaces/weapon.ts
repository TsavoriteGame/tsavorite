import { EquipmentSlot } from './character';
import { IItemInteraction } from './item';

export type WeaponTarget = 'single' | 'all';

export interface IWeaponStatusEffect {
  name: string;
  icon: string;
}

export interface IWeaponAttack {
  name: string;
  icon: string;
  damage: number;
  castTime: number;
  cooldown: number;
  primarySlotTarget?: EquipmentSlot;
  targetting: WeaponTarget;
  interaction?: IItemInteraction;
  applyStatusEffects: string[];
}
