import { IAttachment } from '../../interfaces';
import { SetBackground } from '../../actions';
import { setBackground } from './gamesetup.functions';

export const attachments: IAttachment[] = [
  { action: SetBackground, handler: setBackground }
];
