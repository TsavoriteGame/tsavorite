import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { TranslateModule } from '@ngx-translate/core';

import { PageNotFoundComponent } from './components/';
import { WebviewDirective } from './directives/';
import { FormsModule } from '@angular/forms';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { SweetAlert2Module } from '@sweetalert2/ngx-sweetalert2';
import { IconComponent } from './components/icon/icon.component';

@NgModule({
  declarations: [PageNotFoundComponent, WebviewDirective, IconComponent],
  imports: [
    CommonModule,
    TranslateModule,
    FormsModule,
    NgbModule,
    SweetAlert2Module.forRoot({
    provideSwal: () => import('sweetalert2').then(({ default: swal }) => swal.mixin({
      confirmButtonColor: '#7D10FF',
      denyButtonColor: '#A50000'
    }))
  })],
  exports: [TranslateModule, IconComponent, WebviewDirective, FormsModule, NgbModule]
})
export class SharedModule {}
