import { Injectable } from '@angular/core';
import { Action, Selector, State, StateContext } from '@ngxs/store';
import { Archetype, Background, ItemConfig } from '../../../../../../content/interfaces';
import { StartGame } from '../actions';
import { ContentService } from '../content.service';

export interface IGameCharacter {
  name: string;
  background: Background;
  archetype: Archetype;
  items: ItemConfig[];
}

export interface IGame {
  character: IGameCharacter;
}

const defaultOptions: () => IGame = () => ({
  character: undefined
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
      background,
      archetype,
      items: []
    };

    background.startingKit.forEach(kitItem => {
      character.items.push(this.contentService.reformatItem(kitItem.itemName, kitItem.itemChanges));
    });

    ctx.patchState({ character });
  }

}
