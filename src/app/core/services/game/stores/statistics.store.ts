import { Injectable } from '@angular/core';
import { Action, State, StateContext } from '@ngxs/store';
import { patch } from '@ngxs/store/operators';
import { DecrementStatistic, IncrementStatistic } from '../actions';

export enum GameStatistic {
  StepsTaken = 'stepsTaken',
}

export interface IGameStatistics {
  version: number;
  statistics: Record<GameStatistic, number>;
};

const defaultStatistics: () => IGameStatistics = () => ({
  version: 1,
  statistics: {
    [GameStatistic.StepsTaken]: 0
  }
});

@State<IGameStatistics>({
  name: 'statistics',
  defaults: defaultStatistics()
})
@Injectable()
export class StatisticsState {

  @Action(IncrementStatistic)
  @Action(DecrementStatistic)
  incrementStatistic(ctx: StateContext<IGameStatistics>, { stat, amount }: IncrementStatistic | DecrementStatistic) {
    const current = ctx.getState().statistics[stat] ?? 0;

    ctx.setState(
      patch<IGameStatistics>({
        statistics: patch({
          [stat]: current + amount
        })
      })
    );
  }
}
