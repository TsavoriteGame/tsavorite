import { Injectable } from '@angular/core';
import { Action, Selector, State, StateContext } from '@ngxs/store';
import { SetOption } from '../actions';

export enum GameOption {
  IsPaused = 'isPaused',
  MasterVolume = 'masterVolume',
  FantasyFont = 'fantasyFont'
}

export interface IOptions {
  [GameOption.IsPaused]: boolean;
  [GameOption.MasterVolume]: number;
  [GameOption.FantasyFont]: boolean;
}

const defaultOptions: () => IOptions = () => ({
  [GameOption.IsPaused]: false,
  [GameOption.MasterVolume]: 0.5,
  [GameOption.FantasyFont]: true
});

@State<IOptions>({
  name: 'options',
  defaults: defaultOptions()
})
@Injectable()
export class OptionsState {

  @Selector()
  static allOptions(state: IOptions) {
    return state;
  }

  @Action(SetOption)
  setOption(ctx: StateContext<IOptions>, { option, value }: SetOption) {
    ctx.patchState({ [option]: value });
  }

}
