import { Injectable } from '@angular/core';
import { Action, Selector, State, StateContext } from '@ngxs/store';
import { SetBackground } from '../actions';
import { setDiscordRPCStatus } from '../discord';


export interface IGameSetup {
  chosenBackground: string;
}

const defaultOptions: () => IGameSetup = () => ({
  chosenBackground: ''
});

@State<IGameSetup>({
  name: 'gamesetup',
  defaults: defaultOptions()
})
@Injectable()
export class GameSetupState {

  @Selector()
  static gameSetup(state: IGameSetup) {
    return state;
  }

  @Action(SetBackground)
  setBackground(ctx: StateContext<IGameSetup>, { background }: SetBackground) {
    setDiscordRPCStatus(false, true, '', '');

    ctx.patchState({ chosenBackground: background });
  }

}
