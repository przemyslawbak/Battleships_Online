import { NgModule } from '@angular/core';
import { AppRoutingModule } from '../app-routing.module';
import { BrowserModule } from '@angular/platform-browser';

import { GameMenuComponent } from './game-menu/game-menu.component';
import { GameMainComponent } from './game-main/game-main.component';
import { GameStartComponent } from './game-start/game-start.component';
import { GameEnterComponent } from './game-enter/game-enter.component';
import { GameBestComponent } from './game-best/game-best.component';

@NgModule({
  imports: [AppRoutingModule, BrowserModule],
  declarations: [
    GameMenuComponent,
    GameMainComponent,
    GameStartComponent,
    GameEnterComponent,
    GameBestComponent,
  ],
  exports: [GameMenuComponent, GameMainComponent],
  providers: [],
})
export class GameModule {}
