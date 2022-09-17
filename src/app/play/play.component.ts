import { Component, OnInit } from '@angular/core';
import { Select } from '@ngxs/store';
import { Observable } from 'rxjs';

import { GameState } from '../core/services/game/stores';

@Component({
  selector: 'app-play',
  templateUrl: './play.component.html',
  styleUrls: ['./play.component.scss']
})
export class PlayComponent implements OnInit {

  @Select(GameState.hasGame) hasGame$: Observable<boolean>;

  constructor() { }

  ngOnInit(): void {
  }

}
