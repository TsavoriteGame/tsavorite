import { Component, OnInit } from '@angular/core';
import { Select } from '@ngxs/store';
import { Observable } from 'rxjs';
import { ItemConfig } from '../../../content/interfaces';
import { GameState, IGameCharacter } from '../core/services/game/stores';

@Component({
  selector: 'app-gameplay-backpack',
  templateUrl: './gameplay-backpack.component.html',
  styleUrls: ['./gameplay-backpack.component.scss']
})
export class GameplayBackpackComponent implements OnInit {

  @Select(GameState.character) character$: Observable<IGameCharacter>;

  public readonly slots = Array(16).fill(undefined).map((x, i) => i);

  public combineLeft: ItemConfig;
  public combineRight: ItemConfig;

  constructor() { }

  ngOnInit(): void {
  }

  reaction() {

  }

  combine() {

  }

}
