import { Component, OnInit } from '@angular/core';
import { Select } from '@ngxs/store';
import { Observable } from 'rxjs';
import { GameState, IGameCharacter } from '../core/services/game/stores';

@Component({
  selector: 'app-gameplay-character',
  templateUrl: './gameplay-character.component.html',
  styleUrls: ['./gameplay-character.component.scss']
})
export class GameplayCharacterComponent implements OnInit {

  @Select(GameState.character) character$: Observable<IGameCharacter>;

  constructor() { }

  ngOnInit(): void {
  }

}
