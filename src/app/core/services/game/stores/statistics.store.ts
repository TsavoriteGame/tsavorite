import { Injectable } from '@angular/core';
import { State } from '@ngxs/store';
import { attachAction } from '@ngxs-labs/attach-action';
import { attachments } from '../../../../../../content/attachments/statistics/statistics.attachments';
import { IGameStatistics } from '../../../../../../content/interfaces';
import { defaultStatistics } from '../../../../../../content/attachments/statistics/statistics.functions';

@State<IGameStatistics>({
  name: 'statistics',
  defaults: defaultStatistics()
})
@Injectable()
export class StatisticsState {

  constructor() {
    attachments.forEach(({ action, handler }) => {
      attachAction(StatisticsState, action, handler);
    });
  }

}
