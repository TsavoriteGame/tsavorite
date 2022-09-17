import { Component, OnInit } from '@angular/core';
import { Select } from '@ngxs/store';
import { Observable } from 'rxjs';
import { Archetype, Background } from '../../../content/interfaces';
import { GameSetupState, IGameSetup } from '../core/services/game/stores';

import * as archetypes from '../../../content/archetypes/archetypes.json';
import * as backgrounds from '../../../content/backgrounds/backgrounds.json';

@Component({
  selector: 'app-pre-game-setup',
  templateUrl: './pre-game-setup.component.html',
  styleUrls: ['./pre-game-setup.component.scss']
})
export class PreGameSetupComponent implements OnInit {

  @Select(GameSetupState.gameSetup) gameSetup$: Observable<IGameSetup>;

  public get archetypes(): Background[] {
    return (archetypes as any).default || archetypes;
  }

  public get backgrounds(): Background[] {
    return (backgrounds as any).default || backgrounds;
  }

  public selectedBackground: Background;
  public selectedArchetype: Archetype;

  constructor() { }

  ngOnInit(): void {
  }

  selectBackground(background: Background) {
    if(background.disabled) return;

    this.selectedBackground = background;
    this.selectedArchetype = this.archetypes.find(a => a.name === this.selectedBackground.archetype);
  }

  playGame() {

  }

}
