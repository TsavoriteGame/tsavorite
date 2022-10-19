import { StateContext } from '@ngxs/store';
import { setDiscordRPCStatus } from '../../../src/app/core/services/game/discord';
import { SetBackground } from '../../actions';
import { IGameSetup } from '../../interfaces';

export const defaultSetup: () => IGameSetup = () => ({
  chosenBackground: ''
});

export function setBackground(ctx: StateContext<IGameSetup>, { background }: SetBackground) {
  setDiscordRPCStatus({
    isInGame: false,
    isMakingCharacter: true,
    background: '',
    playerName: ''
  });

  ctx.patchState({ chosenBackground: background });
}
