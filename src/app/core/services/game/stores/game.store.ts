import { Injectable } from '@angular/core';
import { Action, Selector, State, StateContext } from '@ngxs/store';
import { Archetype, Background, ItemConfig } from '../../../../../../content/interfaces';
import { AbandonGame, StartGame } from '../actions';
import { ContentService } from '../content.service';

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

  constructor(private contentService: ContentService) {}

  @Selector()
  static hasGame(state: IGame) {
    return !!state.character;
  }

  @Action(StartGame)
  startGame(ctx: StateContext<IGame>, { gameStartData }: StartGame) {
    const { chosenBackground } = gameStartData;

    const background = this.contentService.backgrounds.find(x => x.name === chosenBackground);
    const archetype = this.contentService.archetypes.find(x => x.name === background.archetype);

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
      }
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

}
