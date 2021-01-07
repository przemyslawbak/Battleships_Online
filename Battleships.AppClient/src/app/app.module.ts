import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppCoreModule } from './app-core/app-core.module';
import { AppTrialsModule } from './app-trials/app-trials.module';
import { AppIdentityModule } from './app-identity/app-identity.module';
import { AppRoutingModule } from './app-routing.module';
import { GameModule } from './app-game/app-game.module';

import { NgxSpinnerModule } from 'ngx-spinner';
import { AppComponent } from './app.component';

@NgModule({
  declarations: [AppComponent],
  imports: [
    AppCoreModule,
    GameModule,
    AppTrialsModule,
    AppIdentityModule,
    BrowserModule,
    NgxSpinnerModule,
    AppRoutingModule,
  ],
  providers: [],
  bootstrap: [AppComponent],
})
export class AppModule {}
