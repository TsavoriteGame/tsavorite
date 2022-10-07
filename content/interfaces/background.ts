import { IModifiableItem } from './item';

export interface IBackground {
  name: string;
  icon: string;
  disabled?: boolean;
  realName: string;
  hp: number;
  description: string;
  archetype: string;
  goal: string;
  startingKit: IModifiableItem[];
}
