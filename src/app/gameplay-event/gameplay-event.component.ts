import { Component, OnInit } from '@angular/core';
import { Select } from '@ngxs/store';
import { Observable } from 'rxjs';
import { GameState, IMapDisplayInfo } from '../core/services/game/stores';

@Component({
  selector: 'app-gameplay-event',
  templateUrl: './gameplay-event.component.html',
  styleUrls: ['./gameplay-event.component.scss']
})
export class GameplayEventComponent implements OnInit {

  @Select(GameState.mapInfo) mapInfo$: Observable<IMapDisplayInfo>;

  constructor() { }

  ngOnInit(): void {
  }

}
