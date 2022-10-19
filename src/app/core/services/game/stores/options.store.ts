import { Injectable } from '@angular/core';
import { Selector, State } from '@ngxs/store';
import { attachAction } from '@ngxs-labs/attach-action';
import { attachments } from '../../../../../../content/attachments/options/options.attachments';
import { defaultOptions } from '../../../../../../content/attachments/options/options.functions';
import { GameOption, IOptions } from '../../../../../../content/interfaces';

@State<IOptions>({
  name: 'options',
  defaults: defaultOptions()
})
@Injectable()
export class OptionsState {

  constructor() {
    attachments.forEach(({ action, handler }) => {
      attachAction(OptionsState, action, handler);
    });
  }

  @Selector()
  static isFantasyFont(state: IOptions) {
    return state[GameOption.IsFantasyFont];
  }

  @Selector()
  static isPaused(state: IOptions) {
    return state[GameOption.IsPaused];
  }

  @Selector()
  static isDebugMode(state: IOptions) {
    return state[GameOption.IsDebugMode];
  }

  @Selector()
  static allOptions(state: IOptions) {
    return state;
  }

  @Selector()
  static keymap(state: IOptions) {
    return state.keymap;
  }

}
