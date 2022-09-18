import { GameOption } from '../stores';

export class SetOption {
  static type = '[Options] Set Option';
  constructor(public option: GameOption, public value: any) {}
}
