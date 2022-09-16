import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { OptionsRoutingModule } from './options-routing.module';
import { OptionsComponent } from './options.component';
import { SharedModule } from '../shared/shared.module';
import { SweetAlert2Module } from '@sweetalert2/ngx-sweetalert2';


@NgModule({
  declarations: [
    OptionsComponent
  ],
  imports: [
    CommonModule,
    SharedModule,
    OptionsRoutingModule,
    SweetAlert2Module
  ]
})
export class OptionsModule { }
