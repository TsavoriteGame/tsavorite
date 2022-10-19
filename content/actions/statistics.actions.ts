import { GameStatistic } from '../interfaces';


export class IncrementStatistic {
  static type = '[Game] Increment Statistic';
  constructor(public stat: GameStatistic, public amount: number) {}
}

export class DecrementStatistic {
  static type = '[Game] Decrement Statistic';
  constructor(public stat: GameStatistic, public amount: number) {
    this.amount = -amount;
  }
}
