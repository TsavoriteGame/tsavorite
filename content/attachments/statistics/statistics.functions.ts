import { StateContext } from '@ngxs/store';
import { patch } from '@ngxs/store/operators';
import { DecrementStatistic, IncrementStatistic } from '../../actions';
import { GameStatistic, IGameStatistics } from '../../interfaces';

export const defaultStatistics: () => IGameStatistics = () => ({
  version: 1,
  statistics: {
    [GameStatistic.StepsTaken]: 0
  }
});

export function incrementStatistic(ctx: StateContext<IGameStatistics>, { stat, amount }: IncrementStatistic | DecrementStatistic) {
  const current = ctx.getState().statistics[stat] ?? 0;

  ctx.setState(
    patch<IGameStatistics>({
      statistics: patch<Record<GameStatistic, number>>({
        [stat]: current + amount
      })
    })
  );
};

