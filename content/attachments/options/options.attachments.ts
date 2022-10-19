import { IAttachment } from '../../interfaces';
import { RebindKey, ResetOptions, SetOption, SetPaused, ToggleOption } from '../../actions';
import { rebindKey, resetOptions, setOption, setPaused, toggleOption } from './options.functions';

export const attachments: IAttachment[] = [
  { action: SetPaused, handler: setPaused },
  { action: ResetOptions, handler: resetOptions },
  { action: SetOption, handler: setOption },
  { action: ToggleOption, handler: toggleOption },
  { action: RebindKey, handler: rebindKey }
];
