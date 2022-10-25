import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpClientModule, HttpClient } from '@angular/common/http';
import { CoreModule } from './core/core.module';
import { SharedModule } from './shared/shared.module';

import { AppRoutingModule } from './app-routing.module';

// NG Translate
import { TranslateModule, TranslateLoader } from '@ngx-translate/core';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';

import { NgxsModule } from '@ngxs/store';
import { NgxsLoggerPluginModule } from '@ngxs/logger-plugin';
import { NgxsStoragePluginModule, StorageOption, STORAGE_ENGINE } from '@ngxs/storage-plugin';
import { NgxsReduxDevtoolsPluginModule } from '@ngxs/devtools-plugin';


import { HomeModule } from './home/home.module';
import { DetailModule } from './detail/detail.module';

import { AppComponent } from './app.component';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { RouterModule } from '@angular/router';
import { OptionsModule } from './options/options.module';
import { PlayModule } from './play/play.module';

import { environment } from '../environments/environment';

import * as Stores from './core/services/game/stores';
import * as Migrations from './core/services/game/stores/migrations';
import { ElectronStorageService } from './core/services/electron/electron.storage';

const allStores = Object.keys(Stores).filter(x => x.includes('State')).map(x => Stores[x]);

// AoT requires an exported function for factories
const httpLoaderFactory = (http: HttpClient): TranslateHttpLoader =>  new TranslateHttpLoader(http, './assets/i18n/', '.json');

@NgModule({
  declarations: [AppComponent],
  imports: [
    BrowserModule,
    FormsModule,
    HttpClientModule,
    CoreModule,
    SharedModule,
    HomeModule,
    DetailModule,
    OptionsModule,
    PlayModule,
    AppRoutingModule,
    RouterModule,
    NgxsModule.forRoot(allStores, {
      developmentMode: !environment.production
    }),
    NgxsLoggerPluginModule.forRoot({
      filter: action => !action.constructor.name.includes('Timer')
    }),
    NgxsStoragePluginModule.forRoot({
      key: allStores.filter(x => x !== Stores.GameSetupState),
      migrations: Object.values(Migrations).flat(),
      storage: StorageOption.LocalStorage
    }),
    NgxsReduxDevtoolsPluginModule.forRoot(),
    TranslateModule.forRoot({
      loader: {
        provide: TranslateLoader,
        useFactory: httpLoaderFactory,
        deps: [HttpClient]
      }
    }),
    NgbModule
  ],
  providers: [
    {
      provide: STORAGE_ENGINE,
      useClass: ElectronStorageService
    }
  ],
  bootstrap: [AppComponent]
})
export class AppModule {}
