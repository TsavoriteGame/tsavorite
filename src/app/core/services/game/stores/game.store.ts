import { Injectable } from '@angular/core';
import { Action, NgxsOnInit, Selector, State, StateContext, Store } from '@ngxs/store';
import { append, patch, removeItem, updateItem } from '@ngxs/store/operators';

import { isUndefined, shuffle, pickBy } from 'lodash';

import { getScenarioByName } from '../../../../../../content/getters';
import * as LandmarkInfo from '../../../../../../content/landmarks';
import { IArchetype, IBackground, ILandmark, IItemConfig,
  ILandmarkEncounter, IPower, IScenario, IScenarioNode, IMapPosition,
  ILandmarkSlot, Interaction, IItemInteraction,
  IScenarioWorld, ISlotFunctionOpts, CardFunction } from '../../../../../../content/interfaces';
import { findFirstLandmarkInWorld, findSpawnCoordinates, getNodeAt } from '../../../../../../content/scenario.helpers';
import { AbandonGame, AddBackpackItem, AddCardToLandmarkSlot,
  AddCoinsToBackpack, AddHealth, EncounterCurrentTile, MakeChoice, Move, ReduceHealth,
  RemoveCharacterItemById, RemoveCardFromLandmarkSlot,
  RemoveCoinsFromBackpack, ReplaceNode, SetCharacterItemLockById, SetCurrentCardId,
  SetEquipmentItem,
  SetLandmarkSlotLock, SetLandmarkSlotTimer, LandmarkSlotTimerExpire, StartGame,
  UpdateCharacterItemById, UpdateEventMessage, Warp,
  IncrementStatistic, SetPlayerSlotLock, SetPlayerSlotTimer,
  PlayerSlotTimerExpire, ChangeAttack, SetPlayerSlotAttack,
  SetLandmarkSlotAttack, PageLoad, RemoveCardFromPlayerSlot, AddCardToPlayerSlot,
  SetPlayerSlotData, SetLandmarkSlotData, SetHealth } from '../actions';
import { ContentService } from '../content.service';
import { GameConstant, GameService } from '../game.service';
import { Observable, Subscription } from 'rxjs';
import { isFunctional } from '../../../../../../content/helpers';
import { setDiscordRPCStatus } from '../discord';
import { LoggerService } from '../logger.service';
import { GameStatistic } from './statistics.store';

import { nothing } from '../../../../../../content/landmarks/helpers/nothing.helpers';
import { identity } from '../../../../../../content/landmarks/helpers/all.helpers';

const allLandmarks = pickBy(LandmarkInfo, (v, k) => !k.toLowerCase().includes('helpers'));
const allHelpers = pickBy(LandmarkInfo, (v, k) => k.toLowerCase().includes('helpers'));

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
  disallowHealthUpdates: boolean;
  chosenAttack: string;
}

export interface IGame {
  character: IGameCharacter;
  position: IMapPosition;
  scenario: IScenario;
  landmarkEncounter: ILandmarkEncounter;
  currentCardId: number;
  currentStep: number;
  currentEventMessage: string;
  version: number;
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
  currentStep: 0,
  currentCardId: 0,
  currentEventMessage: '',
  version: 1
});

@State<IGame>({
  name: 'currentgame',
  defaults: defaultOptions()
})
@Injectable()
export class GameState implements NgxsOnInit {

  private landmarkSubscription: Subscription;

  private callbacks;

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
    return structuredClone(state.character);
  }

  @Selector()
  static characterWithAttacks(state: IGame) {
    const mainHand = state.character.equipment[EquipmentSlot.Hands];
    const weaponAttacks = mainHand?.attacks || [];

    return structuredClone({
      ...state.character,
      attacks: ['Attack', ...weaponAttacks]
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

    this.callbacks = {
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
    };
  }

  private getEncounterOpts(ctx: StateContext<IGame>) {
    const { scenario, position, character } = ctx.getState();
    const node = getNodeAt(scenario, position.worldId, position.x, position.y);

    const encounterOpts = {
      scenario: structuredClone(scenario),
      position: structuredClone(position),
      scenarioNode: structuredClone(node),
      character: structuredClone(character),
      callbacks: this.callbacks
    };

    return encounterOpts;
  }

  private isInGame(ctx: StateContext<IGame>) {
    return !!ctx.getState().character;
  }

  private findCharacterEquipmentSlotWithCardId(character: IGameCharacter, cardId: number): EquipmentSlot | undefined {
    return Object.keys(character.equipment).find(slot => character.equipment[slot]?.cardId === cardId) as EquipmentSlot;
  }

  private updateLandmark(ctx: StateContext<IGame>, observable: Observable<ILandmarkEncounter>) {
    this.landmarkSubscription = observable.subscribe(landmarkEncounterData => {
      const canMove = landmarkEncounterData.canLeave;
      const disallowHealthUpdates = landmarkEncounterData.disallowHealthUpdates;

      ctx.setState(patch<IGame>({
        landmarkEncounter: landmarkEncounterData,
        character: patch<IGameCharacter>({
          stuck: !canMove,
          disallowHealthUpdates
        })
      }));
    });
  }

  private cancelLandmark() {
    if(!this.landmarkSubscription) {
      return;
    }

    this.landmarkSubscription.unsubscribe();
  }

  private getMovableEntities(ctx: StateContext<IGame>) {
    const scenario = ctx.getState().scenario;
    return Object.keys(scenario.worlds)
      .map(worldId => {
        const world = scenario.worlds[worldId];

        const nodes = [];

        for(let y = 0; y < world.layout.length; y++) {
          for(let x = 0; x < world.layout[y].length; x++) {
            const node = getNodeAt(scenario, +worldId, x, y);
            if(!node.landmarkData.moveInterval) {
              continue;
            }

            nodes.push({
              worldId: +worldId,
              x,
              y,
              node
            });
          }
        }

        return nodes;
      })
      .flat();
  }

  // move all movable entities
  private moveOtherEntities(ctx: StateContext<IGame>) {
    const movableEntities = this.getMovableEntities(ctx);
    const currentStep = ctx.getState().currentStep ?? 0;

    const currentPosition = ctx.getState().position;

    movableEntities.forEach(entity => {
      const { moveInterval, moveSteps } = entity.node.landmarkData;

      // only attempt to move when the interval is up
      if(currentStep % moveInterval !== 0) {
        return;
      }

      // if the player is here, don't move
      if(entity.worldId === currentPosition.worldId
      && entity.x === currentPosition.x
      && entity.y === currentPosition.y) {
        return;
      }

      for(let i = 0; i < moveSteps; i++) {
        const { worldId, x, y } = entity;

        const allDirections = shuffle([
          { x: 0,  y: -1 },
          { x: 0,  y: 1 },
          { x: -1, y: 0 },
          { x: 1,  y: 0 }
        ]);

        let didMove = false;

        allDirections.forEach(dir => {
          if(didMove) {
            return;
          }

          // check if we can move to the tile - there must be something there, it can't block movement
          // it can't be Nothing, and it can't be where the player is
          const newTile = getNodeAt(ctx.getState().scenario, worldId, x + dir.x, y + dir.y);
          if(!newTile
          || newTile.blockMovement
          || newTile.landmark !== 'Nothing'
          || (x + dir.x === currentPosition.x && y + dir.y === currentPosition.y && worldId === currentPosition.worldId)) {
            return;
          }

          // swap the nodes
          this.replaceNode(ctx, { position: { worldId, x, y }, newNode: nothing() });
          this.replaceNode(ctx, { position: { worldId, x: x + dir.x, y: y + dir.y }, newNode: structuredClone(entity.node) });

          // only one move per step
          didMove = true;
        });
      }
    });
  }

  // handle the current tile - generally this means to encounter it
  private handleCurrentTile(ctx: StateContext<IGame>) {

    const { scenario, position } = ctx.getState();
    const node = getNodeAt(scenario, position.worldId, position.x, position.y);

    const { landmark } = node;

    // handle landmark
    if(!isUndefined(landmark)) {
      const landmarkRef = allLandmarks[landmark];
      if(!landmarkRef) {
        this.loggerService.error(`Could not find landmark ${landmark}`);
        return;
      }

      const landmarkInstance: ILandmark = new landmarkRef(this.store);

      const encounterOpts = this.getEncounterOpts(ctx);

      this.updateEventMessage(ctx, { message: '' });
      this.updateLandmark(ctx, landmarkInstance.encounter({ ...encounterOpts, callbacks: this.callbacks }));
    }

  }

  @Action(PageLoad)
  pageLoad(ctx: StateContext<IGame>) {
    ctx.setState(patch<IGame>({
      landmarkEncounter: undefined,
      character: patch<IGameCharacter>({
        stuck: false
      })
    }));
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

    ctx.patchState({ currentCardId: 0 });
    this.contentService.setCurrentCardId(0);

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
      stuck: false,
      disallowHealthUpdates: false,
      chosenAttack: 'Attack'
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

    ctx.patchState({ character, scenario, position });

    setDiscordRPCStatus({
      isInGame: true,
      isMakingCharacter: false,
      background: background.name,
      playerName: character.name
    });

    this.move(ctx, { xDelta: 0, yDelta: 0 });
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
      character: patch<IGameCharacter>({
        items: append<IItemConfig>([item])
      })
    }));
  }

  @Action(UpdateCharacterItemById)
  updateBackpackItemById(ctx: StateContext<IGame>, { item, cardId }: UpdateCharacterItemById) {
    if(!this.isInGame(ctx)) {
      return;
    }

    if(!isFunctional(item)) {
      this.removeBackpackItemById(ctx, { cardId });
      return;
    }

    const index = ctx.getState().character.items.findIndex(i => i.cardId === cardId);

    if(index === -1) {

      // check all equipment slots for the item
      const equipmentSlot = this.findCharacterEquipmentSlotWithCardId(ctx.getState().character, cardId);
      if(equipmentSlot) {
        ctx.setState(patch<IGame>({
          character: patch<IGameCharacter>({
            equipment: patch<Record<EquipmentSlot, IItemConfig>>({
              [equipmentSlot]: item
            })
          })
        }));
      }

      return;
    }

    ctx.setState(patch<IGame>({
      character: patch<IGameCharacter>({
        items: updateItem<IItemConfig>(index, item)
      })
    }));
  }

  @Action(SetCharacterItemLockById)
  setBackpackItemLockById(ctx: StateContext<IGame>, { cardId, locked }: SetCharacterItemLockById) {
    if(!this.isInGame(ctx)) {
      return;
    }

    const index = ctx.getState().character.items.findIndex(i => i.cardId === cardId);

    // if we can't find it in the backpack, check the hands
    if(index === -1) {

      // check all equipment slots for the item
      const equipmentSlot = this.findCharacterEquipmentSlotWithCardId(ctx.getState().character, cardId);
      if(equipmentSlot) {
        ctx.setState(patch<IGame>({
          character: patch<IGameCharacter>({
            equipment: patch<Record<EquipmentSlot, IItemConfig>>({
              [equipmentSlot]: patch<IItemConfig>({
                locked
              })
            })
          })
        }));
      }

      return;
    }

    ctx.setState(patch<IGame>({
      character: patch<IGameCharacter>({
        items: updateItem<IItemConfig>(index, patch<IItemConfig>({
          locked
        }))
      })
    }));
  }

  @Action(RemoveCharacterItemById)
  removeBackpackItemById(ctx: StateContext<IGame>, { cardId }: RemoveCharacterItemById) {
    if(!this.isInGame(ctx)) {
      return;
    }

    const index = ctx.getState().character.items.findIndex(i => i.cardId === cardId);

    // if we can't find it in the backpack, check the hands
    if(index === -1) {

      // check all equipment slots for the item
      const equipmentSlot = this.findCharacterEquipmentSlotWithCardId(ctx.getState().character, cardId);
      if(equipmentSlot) {
        ctx.setState(patch<IGame>({
          character: patch<IGameCharacter>({
            equipment: patch<Record<EquipmentSlot, IItemConfig>>({
              [equipmentSlot]: undefined
            })
          })
        }));
      }

      return;
    }

    ctx.setState(patch<IGame>({
      character: patch<IGameCharacter>({
        items: removeItem<IItemConfig>(index)
      })
    }));
  }

  @Action(SetHealth)
  setHealth(ctx: StateContext<IGame>, { amount }: SetHealth) {
    if(!this.isInGame(ctx)) {
      return;
    }

    ctx.setState(patch<IGame>({
      character: patch<IGameCharacter>({
        hp: amount
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
      character: patch<IGameCharacter>({
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

    this.moveOtherEntities(ctx);

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
      position: patch<IMapPosition>({
        x: x + xDelta,
        y: y + yDelta
      })
    }));

    if(xDelta !== 0 || yDelta !== 0) {
      ctx.patchState({ currentStep: ctx.getState().currentStep + 1 });
      this.store.dispatch(new IncrementStatistic(GameStatistic.StepsTaken, 1));
    }

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
      position: patch<IMapPosition>({
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

  // landmark slot stuff
  @Action(SetLandmarkSlotLock)
  setLandmarkSlotLock(ctx: StateContext<IGame>, { slot, isLocked }: SetLandmarkSlotLock) {
    if(!this.isInGame(ctx)) {
      return;
    }

    ctx.setState(patch<IGame>({
      landmarkEncounter: patch<ILandmarkEncounter>({
        slots: updateItem<ILandmarkSlot>(slot, patch<ILandmarkSlot>({
          locked: isLocked
        }))
      })
    }));
  }

  @Action(SetLandmarkSlotTimer)
  setLandmarkSlotTimer(ctx: StateContext<IGame>, { slot, timer, resetMaxTimer }: SetLandmarkSlotTimer) {
    if(!this.isInGame(ctx)) {
      return;
    }

    ctx.setState(patch<IGame>({
      landmarkEncounter: patch<ILandmarkEncounter>({
        slots: updateItem<ILandmarkSlot>(slot, patch<ILandmarkSlot>({
          timer
        }))
      })
    }));

    if(resetMaxTimer) {
      ctx.setState(patch<IGame>({
        landmarkEncounter: patch<ILandmarkEncounter>({
          slots: updateItem<ILandmarkSlot>(slot, patch<ILandmarkSlot>({
            maxTimer: timer
          }))
        })
      }));
    }
  }

  @Action(LandmarkSlotTimerExpire)
  slotTimerExpire(ctx: StateContext<IGame>, { slot }: LandmarkSlotTimerExpire) {
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
    const newLandmark = structuredClone(newState.landmarkEncounter);

    if(!newLandmark) {
      return;
    }

    const opts: ISlotFunctionOpts = {
      card: undefined,
      encounterOpts: this.getEncounterOpts(ctx),
      extraOpts: slotRef.timerExpiredOpts ?? {},
      landmarkEncounter: newLandmark,
      slotIndex: slot,
      store: this.store
    };

    const funcName = slotRef.timerExpired;
    if(!funcName) {
      return;
    }

    const funcRef = allHelpers[`${newLandmark.landmarkType.toLowerCase()}Helpers`]?.[funcName];
    if(!funcRef) {
      this.loggerService.error(`Could not find landmark slot function 'timerExpired' for landmark ${newLandmark.landmarkType}`);
    }

    const func: CardFunction = funcRef ?? identity;

    this.updateLandmark(ctx, func(opts));
  }

  @Action(SetLandmarkSlotAttack)
  setLandmarkSlotAttack(ctx: StateContext<IGame>, { slot, attack }: SetLandmarkSlotAttack) {
    if(!this.isInGame(ctx)) {
      return;
    }

    ctx.setState(patch<IGame>({
      landmarkEncounter: patch<ILandmarkEncounter>({
        slots: updateItem<ILandmarkSlot>(slot, patch<ILandmarkSlot>({
          selectedAttack: attack
        }))
      })
    }));
  }

  @Action(SetLandmarkSlotData)
  setLandmarkSlotData(ctx: StateContext<IGame>, { slot, data }: SetLandmarkSlotData) {
    if(!this.isInGame(ctx)) {
      return;
    }

    const slots = ctx.getState().landmarkEncounter?.slots ?? [];
    const slotRef = slots[slot];
    if(!slotRef) {
      return;
    }

    const currentLandmark = ctx.getState().landmarkEncounter;
    if(!currentLandmark) {
      return;
    }

    ctx.setState(patch<IGame>({
      landmarkEncounter: patch<ILandmarkEncounter>({
        slots: updateItem<ILandmarkSlot>(slot, patch<ILandmarkSlot>({
          slotData: data
        }))
      })
    }));
  }

  // player slot stuff
  @Action(SetPlayerSlotLock)
  setPlayerSlotLock(ctx: StateContext<IGame>, { slot, isLocked }: SetPlayerSlotLock) {
    if(!this.isInGame(ctx)) {
      return;
    }

    ctx.setState(patch<IGame>({
      landmarkEncounter: patch<ILandmarkEncounter>({
        playerSlots: updateItem<ILandmarkSlot>(slot, patch<ILandmarkSlot>({
          locked: isLocked
        }))
      })
    }));
  }

  @Action(SetPlayerSlotTimer)
  setPlayerSlotTimer(ctx: StateContext<IGame>, { slot, timer, resetMaxTimer }: SetPlayerSlotTimer) {
    if(!this.isInGame(ctx)) {
      return;
    }

    ctx.setState(patch<IGame>({
      landmarkEncounter: patch<ILandmarkEncounter>({
        playerSlots: updateItem<ILandmarkSlot>(slot, patch<ILandmarkSlot>({
          timer
        }))
      })
    }));

    if(resetMaxTimer) {
      ctx.setState(patch<IGame>({
        landmarkEncounter: patch<ILandmarkEncounter>({
          playerSlots: updateItem<ILandmarkSlot>(slot, patch<ILandmarkSlot>({
            maxTimer: timer
          }))
        })
      }));
    }
  }

  @Action(PlayerSlotTimerExpire)
  playerSlotTimerExpire(ctx: StateContext<IGame>, { slot }: PlayerSlotTimerExpire) {
    if(!this.isInGame(ctx)) {
      return;
    }

    const playerSlots = ctx.getState().landmarkEncounter?.playerSlots ?? [];
    const slotRef = playerSlots[slot];
    if(!slotRef) {
      return;
    }

    this.cancelLandmark();

    const currentLandmark = ctx.getState().landmarkEncounter;
    if(!currentLandmark) {
      return;
    }

    const newState = ctx.getState();
    const newLandmark = structuredClone(newState.landmarkEncounter);

    if(!newLandmark) {
      return;
    }

    const opts: ISlotFunctionOpts = {
      card: undefined,
      encounterOpts: this.getEncounterOpts(ctx),
      extraOpts: slotRef.timerExpiredOpts ?? {},
      landmarkEncounter: newLandmark,
      slotIndex: slot,
      store: this.store
    };

    const funcName = slotRef.timerExpired;
    if(!funcName) {
      return;
    }

    const funcRef = allHelpers[`${newLandmark.landmarkType.toLowerCase()}Helpers`]?.[funcName];
    if(!funcRef) {
      this.loggerService.error(`Could not find player slot function 'timerExpired' for landmark ${newLandmark.landmarkType}`);
    }

    const func: CardFunction = funcRef ?? identity;

    this.updateLandmark(ctx, func(opts));
  }

  @Action(SetPlayerSlotAttack)
  setPlayerSlotAttack(ctx: StateContext<IGame>, { slot, attack }: SetPlayerSlotAttack) {
    if(!this.isInGame(ctx)) {
      return;
    }

    if(ctx.getState().landmarkEncounter.playerSlots.length === 0) {
      return;
    }

    ctx.setState(patch<IGame>({
      landmarkEncounter: patch<ILandmarkEncounter>({
        playerSlots: updateItem<ILandmarkSlot>(slot, patch<ILandmarkSlot>({
          selectedAttack: attack
        }))
      })
    }));
  }

  @Action(AddCardToLandmarkSlot)
  addCardToSlot(ctx: StateContext<IGame>, { slot, card }: AddCardToLandmarkSlot) {
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
      landmarkEncounter: patch<ILandmarkEncounter>({
        slots: updateItem<ILandmarkSlot>(slot, patch<ILandmarkSlot>({
          card
        }))
      })
    }));

    const newState = ctx.getState();
    const newLandmark = structuredClone(newState.landmarkEncounter);
    const newCard = structuredClone(card);

    if(!newLandmark) {
      return;
    }

    const opts: ISlotFunctionOpts = {
      card: newCard,
      encounterOpts: this.getEncounterOpts(ctx),
      extraOpts: slotRef.cardPlacedOpts ?? {},
      landmarkEncounter: newLandmark,
      slotIndex: slot,
      store: this.store
    };

    const funcName = slotRef.cardPlaced;
    if(!funcName) {
      return;
    }

    const funcRef = allHelpers[`${newLandmark.landmarkType.toLowerCase()}Helpers`]?.[funcName];
    if(!funcRef) {
      this.loggerService.error(`Could not find landmark slot function 'cardPlaced' for landmark ${newLandmark.landmarkType}`);
    }

    const func: CardFunction = funcRef ?? identity;

    this.updateLandmark(ctx, func(opts));
  }

  @Action(AddCardToPlayerSlot)
  addCardToPlayerSlot(ctx: StateContext<IGame>, { slot, card }: AddCardToPlayerSlot) {
    if(!this.isInGame(ctx)) {
      return;
    }

    const slots = ctx.getState().landmarkEncounter?.playerSlots ?? [];
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
      landmarkEncounter: patch<ILandmarkEncounter>({
        playerSlots: updateItem<ILandmarkSlot>(slot, patch<ILandmarkSlot>({
          card
        }))
      })
    }));

    const newState = ctx.getState();
    const newLandmark = structuredClone(newState.landmarkEncounter);
    const newCard = structuredClone(card);

    if(!newLandmark) {
      return;
    }

    const opts: ISlotFunctionOpts = {
      card: newCard,
      encounterOpts: this.getEncounterOpts(ctx),
      extraOpts: slotRef.cardPlacedOpts ?? {},
      landmarkEncounter: newLandmark,
      slotIndex: slot,
      store: this.store
    };

    const funcName = slotRef.cardPlaced;
    if(!funcName) {
      return;
    }

    const funcRef = allHelpers[`${newLandmark.landmarkType.toLowerCase()}Helpers`]?.[funcName];
    if(!funcRef) {
      this.loggerService.error(`Could not find player slot function 'cardPlaced' for landmark ${newLandmark.landmarkType}`);
    }

    const func: CardFunction = funcRef ?? identity;

    this.updateLandmark(ctx, func(opts));
  }

  @Action(RemoveCardFromLandmarkSlot)
  removeCardFromSlot(ctx: StateContext<IGame>, { slot }: RemoveCardFromLandmarkSlot) {
    if(!this.isInGame(ctx)) {
      return;
    }

    const slots = ctx.getState().landmarkEncounter?.slots ?? [];
    const slotRef = slots[slot];
    if(!slotRef) {
      return;
    }

    const currentLandmark = ctx.getState().landmarkEncounter;
    if(!currentLandmark) {
      return;
    }

    ctx.setState(patch<IGame>({
      landmarkEncounter: patch<ILandmarkEncounter>({
        slots: updateItem<ILandmarkSlot>(slot, patch<ILandmarkSlot>({
          card: undefined
        }))
      })
    }));
  }

  @Action(RemoveCardFromPlayerSlot)
  removeCardFromPlayerSlot(ctx: StateContext<IGame>, { slot }: RemoveCardFromPlayerSlot) {
    if(!this.isInGame(ctx)) {
      return;
    }

    const slots = ctx.getState().landmarkEncounter?.playerSlots ?? [];
    const slotRef = slots[slot];
    if(!slotRef) {
      return;
    }

    const currentLandmark = ctx.getState().landmarkEncounter;
    if(!currentLandmark) {
      return;
    }

    ctx.setState(patch<IGame>({
      landmarkEncounter: patch<ILandmarkEncounter>({
        playerSlots: updateItem<ILandmarkSlot>(slot, patch<ILandmarkSlot>({
          card: undefined
        }))
      })
    }));
  }

  @Action(SetPlayerSlotData)
  setPlayerSlotData(ctx: StateContext<IGame>, { slot, data }: SetPlayerSlotData) {
    if(!this.isInGame(ctx)) {
      return;
    }

    const slots = ctx.getState().landmarkEncounter?.playerSlots ?? [];
    const slotRef = slots[slot];
    if(!slotRef) {
      return;
    }

    const currentLandmark = ctx.getState().landmarkEncounter;
    if(!currentLandmark) {
      return;
    }

    ctx.setState(patch<IGame>({
      landmarkEncounter: patch<ILandmarkEncounter>({
        playerSlots: updateItem<ILandmarkSlot>(slot, patch<ILandmarkSlot>({
          slotData: data
        }))
      })
    }));
  }

  @Action(ReplaceNode)
  replaceNode(ctx: StateContext<IGame>, { position, newNode }: ReplaceNode) {
    if(!this.isInGame(ctx)) {
      return;
    }

    newNode.id = -1;

    ctx.setState(patch<IGame>({
      scenario: patch<IScenario>({
        worlds: patch<Record<number, IScenarioWorld>>({
          [position.worldId]: patch<IScenarioWorld>({
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

    // if we cant find coins, we check hands
    if(index === -1) {

      // check the hands, and modify that value
      const handItem = ctx.getState().character.equipment[EquipmentSlot.Hands];
      if(handItem?.interaction.name === Interaction.Buys) {
        const newHandsValue = Math.max(1, handItem.interaction.level + amount);

        ctx.setState(patch<IGame>({
          character: patch<IGameCharacter>({
            equipment: patch<Record<EquipmentSlot, IItemConfig>>({
              [EquipmentSlot.Hands]: patch<IItemConfig>({
                interaction: patch<IItemInteraction>({
                  level: newHandsValue
                })
              })
            })
          })
        }));

        return;
      }

      // if it isn't in hands, we add a new one if the value is positive
      if(amount > 0) {
        const coins = this.contentService.getItemById('GoldCoins-1');
        coins.interaction.level = amount;

        this.addBackpackItem(ctx, { item: coins });
      }

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

    if(slot === EquipmentSlot.Hands) {
      this.changeAttack(ctx, { attack: 'Attack' });
      this.setPlayerSlotAttack(ctx, { slot: 0, attack: 'Attack' });
    }
  }

  @Action(ChangeAttack)
  changeAttack(ctx: StateContext<IGame>, { attack }: ChangeAttack) {
    if(!this.isInGame(ctx)) {
      return;
    }

    ctx.setState(patch<IGame>({
      character: patch<IGameCharacter>({
        chosenAttack: attack
      })
    }));
  }

}
