import { NgModule } from '@angular/core';
import { AppRoutingModule } from '../app-routing.module';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { GameMenuComponent } from './game-menu/game-menu.component';
import { GameMainComponent } from './game-main/game-main.component';
import { GameStartComponent } from './game-start/game-start.component';
import { GameEnterComponent } from './game-enter/game-enter.component';
import { GameBestComponent } from './game-best/game-best.component';
import { GamePlayComponent } from './game-play/game-play.component';

@NgModule({
  imports: [AppRoutingModule, BrowserModule, FormsModule, ReactiveFormsModule],
  declarations: [
    GameMenuComponent,
    GameMainComponent,
    GameStartComponent,
    GameEnterComponent,
    GameBestComponent,
    GamePlayComponent,
  ],
  exports: [GameMenuComponent, GameMainComponent],
  providers: [],
})
export class GameModule {}
