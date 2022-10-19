import { IAttachment } from '../../interfaces';
import { DecrementStatistic, IncrementStatistic } from '../../actions';
import { incrementStatistic } from './statistics.functions';

export const attachments: IAttachment[] = [
  { action: IncrementStatistic, handler: incrementStatistic },
  { action: DecrementStatistic, handler: incrementStatistic }
];
