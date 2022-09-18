import { Injectable } from '@angular/core';
import { Action, Selector, State, StateContext } from '@ngxs/store';
import { SetOption } from '../actions';

export enum GameOption {
  MasterVolume = 'masterVolume'
}

export interface IOptions {
  [GameOption.MasterVolume]: number;
}

const defaultOptions: () => IOptions = () => ({
  [GameOption.MasterVolume]: 0.5
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
