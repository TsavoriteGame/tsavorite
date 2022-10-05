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
  targetting: WeaponTarget;
  interaction?: IItemInteraction;
  applyStatusEffects: string[];
}
