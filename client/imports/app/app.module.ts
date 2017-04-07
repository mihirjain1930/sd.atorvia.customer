import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Angular2TokenService } from 'angular2-token';
import { RouterModule } from '@angular/router';
import { AccountsModule } from 'angular2-meteor-accounts-ui';
import { Ng2PaginationModule } from 'ng2-pagination';
import { Ng2Webstorage } from 'ng2-webstorage';
import { AppComponent } from "./app.component.web";
import { ACC_DECLARATIONS } from "./account/index";
import { routes, ROUTES_PROVIDERS } from './app.routes';
import { SHARED_DECLARATIONS } from './shared';
import { AUTH_DECLARATIONS } from "./auth/index";
import { LAYOUT_DECLARATIONS } from "./layout/index";
import { Page_Declarations } from "./content-page/index";
import { Faq_Declarations } from "./faqs/index";
import { LANDING_DECLARATIONS } from "./landing/index";

import {DASHBOARD_DECLARATIONS} from "./dashboard/index";

// Create config options (see ILocalStorageServiceConfigOptions) for deets:
let localStorageServiceConfig = {
    prefix: '',
    storageType: 'localStorage'
};

let moduleDefinition;

moduleDefinition = {
  imports: [
    BrowserModule,
    FormsModule,
    ReactiveFormsModule,
    RouterModule.forRoot(routes),
    AccountsModule,
    Ng2PaginationModule,
    Ng2Webstorage,
    Ng2Webstorage.forRoot({ prefix: '', separator: '' })
  ],
  declarations: [
    AppComponent,
    ...ACC_DECLARATIONS,
    ...SHARED_DECLARATIONS,
    ...AUTH_DECLARATIONS,
    ...DASHBOARD_DECLARATIONS,
    ...LAYOUT_DECLARATIONS,
    ...Page_Declarations,
    ...Faq_Declarations,
    ...LANDING_DECLARATIONS
  ],
  providers: [
    ...ROUTES_PROVIDERS,
    /*LocalStorageService,
      {
          provide: LOCAL_STORAGE_SERVICE_CONFIG, useValue: localStorageServiceConfig
      }*/
  ],
  bootstrap: [
    AppComponent
  ]
}

@NgModule(moduleDefinition)
export class AppModule {
  constructor() {

  }
}
