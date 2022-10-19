import { StateContext } from '@ngxs/store';
import { patch } from '@ngxs/store/operators';
import { AddEventLogMessage } from '../../actions';
import { IGame } from '../../interfaces';

export function addEventLogMessage(ctx: StateContext<IGame>, { message, truncateAfter }: AddEventLogMessage) {

  const currentEventLog = ctx.getState().currentEventLog || [];

  const newEventLog = [...currentEventLog, message];

  if(truncateAfter) {
    while(newEventLog.length > truncateAfter) {
      newEventLog.shift();
    }
  }

  ctx.setState(patch<IGame>({
    currentEventLog: newEventLog
  }));
}

export function resetEventLog(ctx: StateContext<IGame>) {
  ctx.setState(patch<IGame>({
    currentEventLog: []
  }));
}
