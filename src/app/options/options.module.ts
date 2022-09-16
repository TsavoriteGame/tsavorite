import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { OptionsRoutingModule } from './options-routing.module';
import { OptionsComponent } from './options.component';
import { SharedModule } from '../shared/shared.module';


@NgModule({
  declarations: [
    OptionsComponent
  ],
  imports: [
    CommonModule,
    SharedModule,
    OptionsRoutingModule
  ]
})
export class OptionsModule { }
