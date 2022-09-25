import { Keybind } from '../keybinds.service';
import { GameOption } from '../stores';

export class SetOption {
  static type = '[Options] Set Option';
  constructor(public option: GameOption, public value: any) {}
}

export class ToggleOption {
  static type = '[Options] Toggle Option';
  constructor(public option: GameOption) {}
}

export class RebindKey {
  static type = '[Options] Rebind Key';
  constructor(public keybind: Keybind, public newKey: string) {}
}
