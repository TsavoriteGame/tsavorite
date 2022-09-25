import { Injectable } from '@angular/core';
import { Action, Selector, State, StateContext } from '@ngxs/store';
import { patch } from '@ngxs/store/operators';
import { RebindKey, SetOption } from '../actions';
import { Keybind } from '../keybinds.service';

export enum GameOption {
  IsPaused = 'isPaused',
  MasterVolume = 'masterVolume',
  IsFantasyFont = 'isFantasyFont',
  Keymap = 'keymap'
}

export interface IOptions {
  [GameOption.IsPaused]: boolean;
  [GameOption.MasterVolume]: number;
  [GameOption.IsFantasyFont]: boolean;
  [GameOption.Keymap]: Record<Keybind, string>;
}

export const defaultKeymap: () => Record<Keybind, string> = () => ({
  [Keybind.Pause]: 'Escape',
  [Keybind.MoveUp]: 'ArrowUp',
  [Keybind.MoveDown]: 'ArrowDown',
  [Keybind.MoveLeft]: 'ArrowLeft',
  [Keybind.MoveRight]: 'ArrowRight',
  [Keybind.Choice1]: '1',
  [Keybind.Choice2]: '2',
  [Keybind.Choice3]: '3',
  [Keybind.Choice4]: '4'
});

const defaultOptions: () => IOptions = () => ({
  [GameOption.IsPaused]: false,
  [GameOption.MasterVolume]: 0.5,
  [GameOption.IsFantasyFont]: true,
  [GameOption.Keymap]: defaultKeymap()
});

@State<IOptions>({
  name: 'options',
  defaults: defaultOptions()
})
@Injectable()
export class OptionsState {

  @Selector()
  static isFantasyFont(state: IOptions) {
    return state[GameOption.IsFantasyFont];
  }

  @Selector()
  static isPaused(state: IOptions) {
    return state[GameOption.IsPaused];
  }

  @Selector()
  static allOptions(state: IOptions) {
    return state;
  }

  @Selector()
  static keymap(state: IOptions) {
    return state.keymap;
  }

  @Action(SetOption)
  setOption(ctx: StateContext<IOptions>, { option, value }: SetOption) {
    ctx.patchState({ [option]: value });
  }

  @Action(RebindKey)
  rebindKey(ctx: StateContext<IOptions>, { keybind, newKey }: RebindKey) {
    ctx.setState(patch<IOptions>({
      [GameOption.Keymap]: patch<Record<Keybind, string>>({
        [keybind]: newKey
      })
    }));
  }

}
