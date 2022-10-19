import { type StateContext } from '@ngxs/store';
import { type ContentService } from '../../src/app/core/services/game/content.service';
import { type GameService } from '../../src/app/core/services/game/game.service';
import { type LoggerService } from '../../src/app/core/services/game/logger.service';

export interface IAttachment {
  action: any;
  handler: (ctx: StateContext<any>, action?: any) => void;
}

export interface IAttachmentServices {
  gameService: GameService;
  loggerService: LoggerService;
  contentService: ContentService;
}
