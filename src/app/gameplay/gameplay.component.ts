import { Component, OnInit } from '@angular/core';
import { Select } from '@ngxs/store';
import { Observable } from 'rxjs';
import { GameState } from '../core/services/game/stores';

@Component({
  selector: 'app-gameplay',
  templateUrl: './gameplay.component.html',
  styleUrls: ['./gameplay.component.scss']
})
export class GameplayComponent implements OnInit {

  @Select(GameState.isOutdatedScenario) isOutdatedScenario$: Observable<boolean>;

  constructor() { }

  ngOnInit(): void {
  }

}
