import { Injectable } from '@angular/core';
import { Action, Selector, State, StateContext } from '@ngxs/store';
import { append, patch, removeItem, updateItem } from '@ngxs/store/operators';


import { Archetype, Background, ItemConfig, Power } from '../../../../../../content/interfaces';
import { AbandonGame, AddBackpackItem, RemoveBackpackItem, StartGame, UpdateBackpackItem } from '../actions';
import { ContentService } from '../content.service';
import { GameConstant, GameService } from '../game.service';

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

export interface IGame {
  character: IGameCharacter;
  position: { x: number; y: number };
}

const defaultOptions: () => IGame = () => ({
  character: undefined,
  position: { x: 0, y: 0 },
});

@State<IGame>({
  name: 'currentgame',
  defaults: defaultOptions()
})
@Injectable()
export class GameState {

  constructor(private gameService: GameService, private contentService: ContentService) {}

  @Selector()
  static hasGame(state: IGame) {
    return !!state.character;
  }

  @Selector()
  static character(state: IGame) {
    return state.character;
  }

  private isInGame(ctx: StateContext<IGame>) {
    return !!ctx.getState().character;
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
      character.items.push(this.contentService.reformatItem(kitItem.itemName, kitItem.itemChanges));
    });

    ctx.patchState({ character });
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

}
