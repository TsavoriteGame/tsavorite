import { Injectable } from '@angular/core';
import { NgxsOnInit, Selector, State, StateContext, Store } from '@ngxs/store';
import { attachAction } from '@ngxs-labs/attach-action';

import { getScenarioByName } from '../../../../../../content/getters';
import { IScenarioNode, ICard, IGame, IMapDisplayInfo, GameConstant } from '../../../../../../content/interfaces';
import { getNodeAt } from '../../../../../../content/scenario.helpers';
import { ContentService } from '../content.service';
import { GameService } from '../game.service';
import { LoggerService } from '../logger.service';

import { getAttacksForCharacter } from '../../../../../../content/character.helpers';
import { defaultGame } from '../../../../../../content/attachments/game/game.functions';
import { attachments } from '../../../../../../content/attachments/game/game.attachments';
import { addEventLogMessage } from '../../../../../../content/attachments/game/game.eventlog.functions';
import { setCallbacks } from '../../../../../../content/attachments/game/game.callbacks.functions';
import { setStore } from '../../../../../../content/attachments/game/game.store.functions';
import { setServices } from '../../../../../../content/attachments/game/game.services.functions';

@State<IGame>({
  name: 'currentgame',
  defaults: defaultGame()
})
@Injectable()
export class GameState implements NgxsOnInit {

  constructor(
    private store: Store,
    private gameService: GameService,
    private loggerService: LoggerService,
    private contentService: ContentService
  ) {
    attachments.forEach(({ action, handler }) => {
      attachAction(GameState, action, handler);
    });
  }

  @Selector()
  static isDead(state: IGame) {
    return state.character.hp <= 0;
  }

  @Selector()
  static hasGame(state: IGame) {
    return !!state.character;
  }

  @Selector()
  static eventLog(state: IGame) {
    return state.currentEventLog;
  }

  @Selector()
  static character(state: IGame) {
    return structuredClone(state.character);
  }

  @Selector()
  static characterWithAttacks(state: IGame) {
    return structuredClone({
      ...state.character,
      attacks: getAttacksForCharacter(state.character)
    });
  }

  @Selector()
  static isOutdatedScenario(state: IGame) {
    return getScenarioByName(state.scenario.name).hash !== state.scenario.hash;
  }

  @Selector()
  static landmarkEncounterData(state: IGame) {
    return state.landmarkEncounter;
  }

  @Selector()
  static mapInfo(state: IGame): IMapDisplayInfo {

    const { scenario, position } = state;
    const { worldId, x, y } = position;

    const map: IScenarioNode[][] = [];

    for(let my = y - 3; my <= y + 3; my++) {
      const row: IScenarioNode[] = [];

      for(let mx = x - 3; mx <= x + 3; mx++) {
        const node = getNodeAt(scenario, worldId, mx, my);
        row.push(node);
      }

      map.push(row);
    }

    return {
      scenario,
      position,
      map,
      character: state.character,
      currentNode: map[3][3]
    };
  }

  ngxsOnInit(ctx: StateContext<IGame>) {
    this.contentService.setCurrentCardId(ctx.getState().currentCardId ?? 0);

    setStore(this.store);

    setServices({
      gameService: this.gameService,
      loggerService: this.loggerService,
      contentService: this.contentService
    });

    setCallbacks({
      content: {
        addIdToCard: (card: ICard) => this.contentService.addIdToCard(card),
        getConstant: (constant: GameConstant) => this.gameService.getConstant(constant),
        getItemDataById: (id: string) => this.contentService.getItemDataById(id),
        createItemById: (id: string) => this.contentService.getItemById(id),
        createItemWithModifications: (id: string, modifications: Record<string, number>) =>
          this.contentService.reformatItem(id, modifications)
      },
      logger: {
        log: (...message) => this.loggerService.log(...message),
        error: (...message) => this.loggerService.error(...message)
      },
      newEventLogMessage: (message: string, truncateAfter = 3) => addEventLogMessage(ctx, { message, truncateAfter }),
      newEventMessage: (message: string) => addEventLogMessage(ctx, { message, truncateAfter: 1 }),
    });
  }

}
