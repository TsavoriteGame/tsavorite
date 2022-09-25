import { Injectable } from '@angular/core';
import { Action, Selector, State, StateContext, Store } from '@ngxs/store';
import { append, patch, removeItem, updateItem } from '@ngxs/store/operators';

import { isUndefined } from 'lodash';

import { getScenarioByName } from '../../../../../../content/getters';
import * as AllLandmarks from '../../../../../../content/landmarks';
import { Archetype, Background, ILandmark, ItemConfig,
  LandmarkEncounter, Power, Scenario, ScenarioNode } from '../../../../../../content/interfaces';
import { findFirstLandmarkInWorld, findSpawnCoordinates, getNodeAt } from '../../../../../../content/scenario.helpers';
import { AbandonGame, AddBackpackItem, AddHealth, MakeChoice, Move, ReduceHealth,
  RemoveBackpackItem, StartGame, UpdateBackpackItem, Warp } from '../actions';
import { ContentService } from '../content.service';
import { GameConstant, GameService } from '../game.service';
import { Subscription } from 'rxjs';

export enum EquipmentSlot {
  Head = 'head',
  Hands = 'hands',
  Body = 'body',
  Legs = 'legs'
}

export interface IGameCharacter {
  name: string;
  hp: number;
  background: Background;
  archetype: Archetype;
  equipment: {
    [EquipmentSlot.Head]: ItemConfig;
    [EquipmentSlot.Hands]: ItemConfig;
    [EquipmentSlot.Body]: ItemConfig;
    [EquipmentSlot.Legs]: ItemConfig;
  };
  items: ItemConfig[];
  powers: Power[];
}

export interface IMapPosition {
  worldId: number;
  x: number;
  y: number;
}

export interface IGame {
  character: IGameCharacter;
  position: IMapPosition;
  scenario: Scenario;
  landmarkEncounter: LandmarkEncounter;
}


export interface IMapDisplayInfo {
  scenario: Scenario;
  position: IMapPosition;
  map: ScenarioNode[][];
  character: IGameCharacter;
  currentNode: ScenarioNode;
}

const defaultOptions: () => IGame = () => ({
  character: undefined,
  position: { worldId: 0, x: 0, y: 0 },
  scenario: undefined,
  landmarkEncounter: undefined
});

@State<IGame>({
  name: 'currentgame',
  defaults: defaultOptions()
})
@Injectable()
export class GameState {

  private landmarkSubscription: Subscription;

  constructor(private store: Store, private gameService: GameService, private contentService: ContentService) {}

  @Selector()
  static hasGame(state: IGame) {
    return !!state.character;
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
    const world = scenario.worlds[worldId];

    const map: ScenarioNode[][] = [];

    for(let my = y - 3; my <= y + 3; my++) {
      const row: ScenarioNode[] = [];

      for(let mx = x - 3; mx <= x + 3; mx++) {
        const nodeId = world.layout[my]?.[mx] ?? -1;
        row.push(scenario.nodes[nodeId]);
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

  private isInGame(ctx: StateContext<IGame>) {
    return !!ctx.getState().character;
  }

  private cancelLandmark() {
    if(!this.landmarkSubscription) return;

    this.landmarkSubscription.unsubscribe();
  }

  private handleCurrentTile(ctx: StateContext<IGame>) {

    const { scenario, position } = ctx.getState();
    const node = getNodeAt(scenario, position.worldId, position.x, position.y);

    const { landmark } = node;

    // handle landmark
    if(!isUndefined(landmark)) {
      const landmarkRef = AllLandmarks[landmark];
      if(!landmarkRef) {
        console.error(`Could not find landmark ${landmark}`);
        return;
      }

      const landmarkInstance: ILandmark = new landmarkRef(this.store);

      const sub = landmarkInstance.encounter(scenario, node).subscribe(landmarkEncounterData => {
        ctx.setState(patch<IGame>({
          landmarkEncounter: landmarkEncounterData
        }));
      });

      this.landmarkSubscription = sub;
    }

  }

  @Action(StartGame)
  startGame(ctx: StateContext<IGame>, { gameStartData }: StartGame) {
    const { chosenBackground } = gameStartData;

    const background = this.contentService.getBackground(chosenBackground);
    if(!background) {
      console.error('Background does not exist; game cannot start.');
      return;
    }

    const archetype = this.contentService.getArchetype(background.archetype);
    if(!archetype) {
      console.error('Archetype does not exist; game cannot start.');
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
        [EquipmentSlot.Legs]: undefined
      },
      powers: [
        undefined,
        undefined,
      ]
    };

    background.startingKit.forEach(kitItem => {
      const item = this.contentService.reformatItem(kitItem.itemId, kitItem.itemChanges);
      if(!item) {
        console.error(`Could not find item ${kitItem.itemId} for starting kit.`);
        return;
      }

      character.items.push(item);
    });

    const scenario = getScenarioByName('Tutorial');
    const position = findSpawnCoordinates(scenario);

    ctx.patchState({ character, scenario, position });

    this.store.dispatch(new Move(0, 0));
  }

  @Action(AbandonGame)
  abandonGame(ctx: StateContext<IGame>) {
    ctx.setState(defaultOptions());
  }

  @Action(AddBackpackItem)
  addBackpackItem(ctx: StateContext<IGame>, { item }: AddBackpackItem) {
    if(!this.isInGame(ctx)) return;

    if(ctx.getState().character.items.length >= this.gameService.getConstant(GameConstant.BackpackSize)) return;

    ctx.setState(patch<IGame>({
      character: patch({
        items: append<ItemConfig>([item])
      })
    }));
  }

  @Action(UpdateBackpackItem)
  updateBackpackItem(ctx: StateContext<IGame>, { item, index }: UpdateBackpackItem) {
    if(!this.isInGame(ctx)) return;

    ctx.setState(patch<IGame>({
      character: patch({
        items: updateItem<ItemConfig>(index, item)
      })
    }));
  }

  @Action(RemoveBackpackItem)
  removeBackpackItem(ctx: StateContext<IGame>, { index }: RemoveBackpackItem) {
    if(!this.isInGame(ctx)) return;

    ctx.setState(patch<IGame>({
      character: patch({
        items: removeItem<ItemConfig>(index)
      })
    }));
  }

  @Action(AddHealth)
  @Action(ReduceHealth)
  changeHealth(ctx: StateContext<IGame>, { amount }: AddHealth) {
    if(!this.isInGame(ctx)) return;

    const currentHP = ctx.getState().character.hp;

    ctx.setState(patch<IGame>({
      character: patch({
        hp: currentHP + amount
      })
    }));
  }

  @Action(Move)
  move(ctx: StateContext<IGame>, { xDelta, yDelta }: Move) {
    if(!this.isInGame(ctx)) return;

    if(xDelta > 1 || xDelta < -1 || yDelta > 1 || yDelta < -1) return;

    const { worldId, x, y } = ctx.getState().position;

    const targetNodeId = ctx.getState().scenario.worlds[worldId].layout[y + yDelta]?.[x + xDelta];
    const targetNode = ctx.getState().scenario.nodes[targetNodeId];

    if(!targetNode) return;
    if(targetNode.blockMovement) return;

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
    if(!this.isInGame(ctx)) return;

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
    if(!this.isInGame(ctx)) return;

    const choices = ctx.getState().landmarkEncounter?.choices ?? [];
    const choiceRef = choices[choice];
    if(!choiceRef) return;

    this.cancelLandmark();

    const currentLandmark = ctx.getState().landmarkEncounter;
    if(!currentLandmark) return;

    const sub = choiceRef.callback(currentLandmark).subscribe(landmarkEncounterData => {
      ctx.setState(patch<IGame>({
        landmarkEncounter: landmarkEncounterData
      }));
    });

    this.landmarkSubscription = sub;
  }

}
