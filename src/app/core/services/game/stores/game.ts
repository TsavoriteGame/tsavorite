import { Injectable } from '@angular/core';
import { Action, Selector, State, StateContext } from '@ngxs/store';
import { StartGame } from '../actions';

export interface IGameCharacter {
  name: string;
  background: string;
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

  @Selector()
  static hasGame(state: IGame) {
    return !!state.character;
  }

  @Action(StartGame)
  startGame(ctx: StateContext<IGame>, { gameStartData }: StartGame) {
    console.log('start game', gameStartData);
  }

}
