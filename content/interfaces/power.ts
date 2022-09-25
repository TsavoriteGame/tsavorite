import { ICard } from './card';

export interface IPower extends ICard {
  timerModifier?: number;
}
