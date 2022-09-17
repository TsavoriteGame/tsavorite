import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { PlayRoutingModule } from './play-routing.module';
import { PlayComponent } from './play.component';
import { SharedModule } from '../shared/shared.module';
import { SweetAlert2Module } from '@sweetalert2/ngx-sweetalert2';
import { GameplayComponent } from '../gameplay/gameplay.component';
import { PreGameSetupComponent } from '../pre-game-setup/pre-game-setup.component';
import { GameplayBackpackComponent } from '../gameplay-backpack/gameplay-backpack.component';
import { GameplayCharacterComponent } from '../gameplay-character/gameplay-character.component';
import { GameplayEventComponent } from '../gameplay-event/gameplay-event.component';
import { GameplayMapComponent } from '../gameplay-map/gameplay-map.component';


@NgModule({
  declarations: [
    PlayComponent,
    PreGameSetupComponent,
    GameplayComponent,
    GameplayBackpackComponent,
    GameplayCharacterComponent,
    GameplayEventComponent,
    GameplayMapComponent
  ],
  imports: [
    CommonModule,
    PlayRoutingModule,
    SharedModule,
    SweetAlert2Module
  ]
})
export class PlayModule { }
