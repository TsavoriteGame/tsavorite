import { Injectable } from '@angular/core';
import { Action, NgxsOnInit, Selector, State, StateContext, Store } from '@ngxs/store';
import { append, patch, removeItem, updateItem } from '@ngxs/store/operators';

import { isUndefined } from 'lodash';

import { getScenarioByName } from '../../../../../../content/getters';
import * as AllLandmarks from '../../../../../../content/landmarks';
import { IArchetype, IBackground, ILandmark, IItemConfig,
  ILandmarkEncounter, IPower, IScenario, IScenarioNode, IMapPosition,
  ILandmarkSlot, Interaction, IItemInteraction } from '../../../../../../content/interfaces';
import { findFirstLandmarkInWorld, findSpawnCoordinates, getNodeAt } from '../../../../../../content/scenario.helpers';
import { AbandonGame, AddBackpackItem, AddCardToSlot, AddCoinsToBackpack, AddHealth, EncounterCurrentTile, MakeChoice, Move, ReduceHealth,
  RemoveBackpackItem, RemoveBackpackItemById, RemoveCardFromSlot,
  RemoveCoinsFromBackpack, ReplaceNode, SetBackpackItemLockById, SetCurrentCardId,
  SetEquipmentItem,
  SetLandmarkSlotLock, SetLandmarkSlotTimer, SlotTimerExpire, StartGame,
  UpdateBackpackItem, UpdateBackpackItemById, UpdateEventMessage, Warp } from '../actions';
import { ContentService } from '../content.service';
import { GameConstant, GameService } from '../game.service';
import { Observable, Subscription } from 'rxjs';
import { isFunctional } from '../../../../../../content/helpers';
import { setDiscordRPCStatus } from '../discord';
import { LoggerService } from '../logger.service';

export enum EquipmentSlot {
  Head = 'head',
  Hands = 'hands',
  Body = 'body',
  Feet = 'feet'
}

export interface IGameCharacter {
  name: string;
  hp: number;
  background: IBackground;
  archetype: IArchetype;
  equipment: {
    [EquipmentSlot.Head]: IItemConfig;
    [EquipmentSlot.Hands]: IItemConfig;
    [EquipmentSlot.Body]: IItemConfig;
    [EquipmentSlot.Feet]: IItemConfig;
  };
  items: IItemConfig[];
  powers: IPower[];

  stuck: boolean;
}

export interface IGame {
  character: IGameCharacter;
  position: IMapPosition;
  scenario: IScenario;
  landmarkEncounter: ILandmarkEncounter;
  currentCardId: number;
  currentEventMessage: string;
}


export interface IMapDisplayInfo {
  scenario: IScenario;
  position: IMapPosition;
  map: IScenarioNode[][];
  character: IGameCharacter;
  currentNode: IScenarioNode;
}

const defaultOptions: () => IGame = () => ({
  character: undefined,
  position: { worldId: 0, x: 0, y: 0 },
  scenario: undefined,
  landmarkEncounter: undefined,
  currentCardId: 0,
  currentEventMessage: ''
});

@State<IGame>({
  name: 'currentgame',
  defaults: defaultOptions()
})
@Injectable()
export class GameState implements NgxsOnInit {

  private landmarkSubscription: Subscription;

  constructor(
    private store: Store,
    private gameService: GameService,
    private loggerService: LoggerService,
    private contentService: ContentService
  ) {}

  @Selector()
  static isDead(state: IGame) {
    return state.character.hp <= 0;
  }

  @Selector()
  static hasGame(state: IGame) {
    return !!state.character;
  }

  @Selector()
  static eventMessage(state: IGame) {
    return state.currentEventMessage;
  }

  @Selector()
  static character(state: IGame) {
    return state.character;
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
  }

  private isInGame(ctx: StateContext<IGame>) {
    return !!ctx.getState().character;
  }

  private updateLandmark(ctx: StateContext<IGame>, observable: Observable<ILandmarkEncounter>) {
    const sub = observable.subscribe(landmarkEncounterData => {
      const canMove = landmarkEncounterData.canLeave;

      ctx.setState(patch<IGame>({
        landmarkEncounter: landmarkEncounterData,
        character: patch<IGameCharacter>({
          stuck: !canMove
        })
      }));
    });

    this.landmarkSubscription = sub;
  }

  private cancelLandmark() {
    if(!this.landmarkSubscription) {
      return;
    }

    this.landmarkSubscription.unsubscribe();
  }

  private handleCurrentTile(ctx: StateContext<IGame>) {

    const { scenario, position, character } = ctx.getState();
    const node = getNodeAt(scenario, position.worldId, position.x, position.y);

    const { landmark } = node;

    // handle landmark
    if(!isUndefined(landmark)) {
      const landmarkRef = AllLandmarks[landmark];
      if(!landmarkRef) {
        this.loggerService.error(`Could not find landmark ${landmark}`);
        return;
      }

      const landmarkInstance: ILandmark = new landmarkRef(this.store);

      const encounterOpts = {
        scenario: structuredClone(scenario),
        position: structuredClone(position),
        scenarioNode: structuredClone(node),
        character: structuredClone(character),
        callbacks: {
          content: {
            getConstant: (constant: GameConstant) => this.gameService.getConstant(constant),
            getItemDataById: (id: string) => this.contentService.getItemDataById(id),
            createItemById: (id: string) => this.contentService.getItemById(id)
          },
          logger: {
            log: (...message) => this.loggerService.log(...message),
            error: (...message) => this.loggerService.error(...message)
          },
          newEventMessage: (message: string) => this.updateEventMessage(ctx, { message }),
        }
      };

      this.updateEventMessage(ctx, { message: '' });
      this.updateLandmark(ctx, landmarkInstance.encounter(encounterOpts));
    }

  }

  @Action(StartGame)
  startGame(ctx: StateContext<IGame>, { gameStartData }: StartGame) {
    const { chosenBackground } = gameStartData;

    const background = this.contentService.getBackground(chosenBackground);
    if(!background) {
      this.loggerService.error('Background does not exist; game cannot start.');
      return;
    }

    const archetype = this.contentService.getArchetype(background.archetype);
    if(!archetype) {
      this.loggerService.error('Archetype does not exist; game cannot start.');
      return;
    }

    const character: IGameCharacter = {
      name: background.realName,
      hp: background.hp,
      background,
      archetype,
      items: [],
      equipment: {
        [EquipmentSlot.Head]: undefined,
        [EquipmentSlot.Hands]: undefined,
        [EquipmentSlot.Body]: undefined,
        [EquipmentSlot.Feet]: undefined
      },
      powers: [
        undefined,
        undefined,
      ],
      stuck: false
    };

    background.startingKit.forEach(kitItem => {
      const item = this.contentService.reformatItem(kitItem.itemId, kitItem.itemChanges);
      if(!item) {
        this.loggerService.error(`Could not find item ${kitItem.itemId} for starting kit.`);
        return;
      }

      character.items.push(item);
    });

    const scenario = getScenarioByName('Test');
    const position = findSpawnCoordinates(scenario);

    ctx.patchState({ character, scenario, position, currentCardId: 0 });
    this.contentService.setCurrentCardId(0);

    setDiscordRPCStatus({
      isInGame: true,
      isMakingCharacter: false,
      background: background.name,
      playerName: character.name
    });

    this.store.dispatch(new Move(0, 0));
  }

  @Action(SetCurrentCardId)
  setCurrenCardId(ctx: StateContext<IGame>, { cardId }: SetCurrentCardId) {
    ctx.setState(patch<IGame>({
      currentCardId: cardId
    }));
  }

  @Action(UpdateEventMessage)
  updateEventMessage(ctx: StateContext<IGame>, { message }: UpdateEventMessage) {
    ctx.setState(patch<IGame>({
      currentEventMessage: message
    }));
  }

  @Action(AbandonGame)
  abandonGame(ctx: StateContext<IGame>) {
    setDiscordRPCStatus({
      isInGame: false,
      isMakingCharacter: false,
      background: '',
      playerName: ''
    });

    ctx.setState(defaultOptions());
  }

  @Action(AddBackpackItem)
  addBackpackItem(ctx: StateContext<IGame>, { item }: AddBackpackItem) {
    if(!this.isInGame(ctx)) {
      return;
    }

    if(ctx.getState().character.items.length >= this.gameService.getConstant(GameConstant.BackpackSize)) {
      return;
    }

    if(isUndefined(item.cardId)) {
      this.loggerService.error(new Error('Cannot add item without cardId to backpack.'));
      return;
    }

    ctx.setState(patch<IGame>({
      character: patch({
        items: append<IItemConfig>([item])
      })
    }));
  }

  @Action(UpdateBackpackItem)
  updateBackpackItem(ctx: StateContext<IGame>, { item, index }: UpdateBackpackItem) {
    if(!this.isInGame(ctx)) {
      return;
    }

    if(!isFunctional(item)) {
      this.removeBackpackItem(ctx, { index });
      return;
    }

    ctx.setState(patch<IGame>({
      character: patch({
        items: updateItem<IItemConfig>(index, item)
      })
    }));
  }

  @Action(UpdateBackpackItemById)
  updateBackpackItemById(ctx: StateContext<IGame>, { item, cardId }: UpdateBackpackItemById) {
    if(!this.isInGame(ctx)) {
      return;
    }

    if(!isFunctional(item)) {
      this.removeBackpackItemById(ctx, { cardId });
      return;
    }

    const index = ctx.getState().character.items.findIndex(i => i.cardId === cardId);

    ctx.setState(patch<IGame>({
      character: patch({
        items: updateItem<IItemConfig>(index, item)
      })
    }));
  }

  @Action(SetBackpackItemLockById)
  setBackpackItemLockById(ctx: StateContext<IGame>, { cardId, locked }: SetBackpackItemLockById) {
    if(!this.isInGame(ctx)) {
      return;
    }

    const index = ctx.getState().character.items.findIndex(i => i.cardId === cardId);

    ctx.setState(patch<IGame>({
      character: patch({
        items: updateItem<IItemConfig>(index, patch<IItemConfig>({
          locked
        }))
      })
    }));
  }

  @Action(RemoveBackpackItem)
  removeBackpackItem(ctx: StateContext<IGame>, { index }: RemoveBackpackItem) {
    if(!this.isInGame(ctx)) {
      return;
    }

    ctx.setState(patch<IGame>({
      character: patch({
        items: removeItem<IItemConfig>(index)
      })
    }));
  }

  @Action(RemoveBackpackItemById)
  removeBackpackItemById(ctx: StateContext<IGame>, { cardId }: RemoveBackpackItemById) {
    if(!this.isInGame(ctx)) {
      return;
    }

    const index = ctx.getState().character.items.findIndex(i => i.cardId === cardId);

    ctx.setState(patch<IGame>({
      character: patch({
        items: removeItem<IItemConfig>(index)
      })
    }));
  }

  @Action(AddHealth)
  @Action(ReduceHealth)
  changeHealth(ctx: StateContext<IGame>, { amount }: AddHealth) {
    if(!this.isInGame(ctx)) {
      return;
    }

    const currentHP = ctx.getState().character.hp;

    ctx.setState(patch<IGame>({
      character: patch({
        hp: currentHP + amount
      })
    }));
  }

  @Action(EncounterCurrentTile)
  @Action(Move)
  move(ctx: StateContext<IGame>, { xDelta, yDelta }: Move) {
    if(!this.isInGame(ctx)) {
      return;
    }

    // characters can only move one tile at a time
    if(xDelta > 1 || xDelta < -1 || yDelta > 1 || yDelta < -1) {
      return;
    }

    // if the character is stuck and tries to move in any direction that isn't 0,0 (the same tile), do nothing
    if(ctx.getState().character.stuck && (xDelta !== 0 || yDelta !== 0)) {
      return;
    }

    const { worldId, x, y } = ctx.getState().position;

    const targetNodeRef = ctx.getState().scenario.worlds[worldId].layout[y + yDelta]?.[x + xDelta];
    if(!targetNodeRef) {
      return;
    }

    let targetNode = targetNodeRef;
    if(targetNodeRef.id !== -1) {
      targetNode = ctx.getState().scenario.nodes[targetNodeRef.id];
    }

    if(targetNode.blockMovement) {
      return;
    }

    ctx.setState(patch<IGame>({
      position: patch({
        x: x + xDelta,
        y: y + yDelta
      })
    }));

    this.cancelLandmark();
    this.handleCurrentTile(ctx);
  }

  @Action(Warp)
  warp(ctx: StateContext<IGame>, { scenario, warpToWorld, warpToLandmark }: Warp) {
    if(!this.isInGame(ctx)) {
      return;
    }

    const nodePosition = findFirstLandmarkInWorld(scenario, warpToWorld, warpToLandmark);

    ctx.setState(patch<IGame>({
      position: patch({
        ...nodePosition
      })
    }));

    this.cancelLandmark();
    this.handleCurrentTile(ctx);
  }

  @Action(MakeChoice)
  makeChoice(ctx: StateContext<IGame>, { choice }: MakeChoice) {
    if(!this.isInGame(ctx)) {
      return;
    }

    const choices = ctx.getState().landmarkEncounter?.choices ?? [];
    const choiceRef = choices[choice];
    if(!choiceRef) {
      return;
    }

    this.cancelLandmark();

    const currentLandmark = ctx.getState().landmarkEncounter;
    if(!currentLandmark) {
      return;
    }

    this.updateLandmark(ctx, choiceRef.callback(currentLandmark));
  }

  @Action(SetLandmarkSlotLock)
  setLandmarkSlotLock(ctx: StateContext<IGame>, { slot, isLocked }: SetLandmarkSlotLock) {
    if(!this.isInGame(ctx)) {
      return;
    }

    ctx.setState(patch<IGame>({
      landmarkEncounter: patch({
        slots: updateItem<ILandmarkSlot>(slot, patch({
          locked: isLocked
        }))
      })
    }));
  }

  @Action(SetLandmarkSlotTimer)
  setLandmarkSlotTimer(ctx: StateContext<IGame>, { slot, timer }: SetLandmarkSlotTimer) {
    if(!this.isInGame(ctx)) {
      return;
    }

    ctx.setState(patch<IGame>({
      landmarkEncounter: patch({
        slots: updateItem<ILandmarkSlot>(slot, patch({
          timer
        }))
      })
    }));
  }

  @Action(AddCardToSlot)
  addCardToSlot(ctx: StateContext<IGame>, { slot, card }: AddCardToSlot) {
    if(!this.isInGame(ctx)) {
      return;
    }

    const slots = ctx.getState().landmarkEncounter?.slots ?? [];
    const slotRef = slots[slot];
    if(!slotRef) {
      return;
    }

    this.cancelLandmark();

    const currentLandmark = ctx.getState().landmarkEncounter;
    if(!currentLandmark) {
      return;
    }

    ctx.setState(patch<IGame>({
      landmarkEncounter: patch({
        slots: updateItem<ILandmarkSlot>(slot, patch({
          card
        }))
      })
    }));

    const newState = ctx.getState();
    const newLandmark = newState.landmarkEncounter;
    const newCard = structuredClone(card);

    this.updateLandmark(ctx, slotRef.cardPlaced(newLandmark, slot, newCard));
  }

  @Action(RemoveCardFromSlot)
  removeCardFromSlot(ctx: StateContext<IGame>, { slot }: RemoveCardFromSlot) {
    if(!this.isInGame(ctx)) {
      return;
    }

    const slots = ctx.getState().landmarkEncounter?.slots ?? [];
    const slotRef = slots[slot];
    if(!slotRef) {
      return;
    }

    this.cancelLandmark();

    const currentLandmark = ctx.getState().landmarkEncounter;
    if(!currentLandmark) {
      return;
    }

    ctx.setState(patch<IGame>({
      landmarkEncounter: patch({
        slots: updateItem<ILandmarkSlot>(slot, patch({
          card: undefined
        }))
      })
    }));
  }

  @Action(SlotTimerExpire)
  slotTimerExpire(ctx: StateContext<IGame>, { slot }: AddCardToSlot) {
    if(!this.isInGame(ctx)) {
      return;
    }

    const slots = ctx.getState().landmarkEncounter?.slots ?? [];
    const slotRef = slots[slot];
    if(!slotRef) {
      return;
    }

    this.cancelLandmark();

    const currentLandmark = ctx.getState().landmarkEncounter;
    if(!currentLandmark) {
      return;
    }

    const newState = ctx.getState();
    const newLandmark = newState.landmarkEncounter;

    this.updateLandmark(ctx, slotRef.timerExpired(newLandmark, slot));
  }

  @Action(ReplaceNode)
  replaceNode(ctx: StateContext<IGame>, { position, newNode }: ReplaceNode) {
    if(!this.isInGame(ctx)) {
      return;
    }

    newNode.id = -1;

    ctx.setState(patch<IGame>({
      scenario: patch({
        worlds: patch({
          [position.worldId]: patch({
            layout: updateItem<IScenarioNode[]>(position.y, updateItem<IScenarioNode>(position.x, newNode))
          })
        })
      })
    }));

  }

  @Action(RemoveCoinsFromBackpack)
  @Action(AddCoinsToBackpack)
  addCoinsToBackpack(ctx: StateContext<IGame>, { amount }: AddCoinsToBackpack) {
    if(!this.isInGame(ctx)) {
      return;
    }

    const index = ctx.getState().character.items.findIndex(checkItem => checkItem.interaction?.name === Interaction.Buys);

    // if we cant find coins, we add coins
    if(index === -1) {
      const coins = this.contentService.getItemById('GoldCoins-1');
      coins.interaction.level = amount;

      this.addBackpackItem(ctx, { item: coins });
      return;
    }

    // find out how many coins we have, and add some more
    const item = ctx.getState().character.items[index];
    const newValue = Math.max(1, item.interaction.level + amount);

    ctx.setState(patch<IGame>({
      character: patch<IGameCharacter>({
        items: updateItem<IItemConfig>(index, patch<IItemConfig>({
          interaction: patch<IItemInteraction>({
            level: newValue
          })
        }))
      })
    }));

  }

  @Action(SetEquipmentItem)
  setEquipmentItem(ctx: StateContext<IGame>, { item, slot }: SetEquipmentItem) {
    ctx.setState(patch<IGame>({
      character: patch<IGameCharacter>({
        equipment: patch<Record<EquipmentSlot, IItemConfig>>({
          [slot]: item
        })
      })
    }));
  }

}
