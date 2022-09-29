import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { DndModule } from 'ngx-drag-drop';
import { AngularSvgIconModule } from 'angular-svg-icon';

import { TranslateModule } from '@ngx-translate/core';

import { PageNotFoundComponent } from './components/';
import { WebviewDirective } from './directives/';
import { FormsModule } from '@angular/forms';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { SweetAlert2Module } from '@sweetalert2/ngx-sweetalert2';
import { IconComponent } from './components/icon/icon.component';
import { InfoCardComponent } from './components/info-card/info-card.component';
import { CardSlotComponent } from './components/card-slot/card-slot.component';
import { PauseComponent } from './components/pause/pause.component';
import { FancyTitleBackgroundComponent } from './components/fancy-title-background/fancy-title-background.component';
import { SplashscreenComponent } from './components/splashscreen/splashscreen.component';
import { KeyDisplayComponent } from './components/key-display/key-display.component';
import { GameOverComponent } from './components/game-over/game-over.component';

@NgModule({
  declarations: [PageNotFoundComponent, WebviewDirective, IconComponent,
    InfoCardComponent, CardSlotComponent, PauseComponent, FancyTitleBackgroundComponent,
    SplashscreenComponent, KeyDisplayComponent, GameOverComponent],
  imports: [
    CommonModule,
    DndModule,
    TranslateModule,
    FormsModule,
    NgbModule,
    AngularSvgIconModule.forRoot(),
    SweetAlert2Module.forRoot({
      provideSwal: () => import('sweetalert2').then(({ default: swal }) => swal.mixin({
        confirmButtonColor: '#7D10FF',
        denyButtonColor: '#A50000'
      }))
    })],
  exports: [AngularSvgIconModule, DndModule, TranslateModule, IconComponent, FancyTitleBackgroundComponent, KeyDisplayComponent,
    CardSlotComponent, SplashscreenComponent, InfoCardComponent, WebviewDirective, FormsModule, NgbModule]
})
export class SharedModule {}
