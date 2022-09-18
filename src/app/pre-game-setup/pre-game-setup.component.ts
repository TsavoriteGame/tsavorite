import { Component, OnInit } from '@angular/core';
import { Select, Store } from '@ngxs/store';
import { Observable } from 'rxjs';
import { Archetype, Background } from '../../../content/interfaces';
import { GameSetupState, IGameSetup } from '../core/services/game/stores';

import { SetBackground, StartGame } from '../core/services/game/actions';
import { ContentService } from '../core/services/game/content.service';

@Component({
  selector: 'app-pre-game-setup',
  templateUrl: './pre-game-setup.component.html',
  styleUrls: ['./pre-game-setup.component.scss']
})
export class PreGameSetupComponent implements OnInit {

  @Select(GameSetupState.gameSetup) gameSetup$: Observable<IGameSetup>;

  public selectedBackground: Background;
  public selectedArchetype: Archetype;

  constructor(private store: Store, public contentService: ContentService) { }

  ngOnInit(): void {
  }

  selectBackground(background: Background) {
    if(background.disabled) return;

    this.selectedBackground = background;
    this.selectedArchetype = this.contentService.archetypes.find(a => a.name === this.selectedBackground.archetype);

    this.store.dispatch(new SetBackground(background.name));
  }

  playGame(startData: IGameSetup) {
    this.store.dispatch(new StartGame(startData));
  }

}
