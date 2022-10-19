import { Injectable } from '@angular/core';
import { Selector, State } from '@ngxs/store';
import { attachAction } from '@ngxs-labs/attach-action';
import { attachments } from '../../../../../../content/attachments/gamesetup/gamesetup.attachments';
import { defaultSetup } from '../../../../../../content/attachments/gamesetup/gamesetup.functions';
import { IGameSetup } from '../../../../../../content/interfaces';

@State<IGameSetup>({
  name: 'gamesetup',
  defaults: defaultSetup()
})
@Injectable()
export class GameSetupState {

  constructor() {
    attachments.forEach(({ action, handler }) => {
      attachAction(GameSetupState, action, handler);
    });
  }

  @Selector()
  static gameSetup(state: IGameSetup) {
    return state;
  }

}
