import { NgModule } from '@angular/core';
import { AppRoutingModule } from '../app-routing.module';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { GameMenuComponent } from './game-menu/game-menu.component';
import { GameMainComponent } from './game-main/game-main.component';
import { GameStartComponent } from './game-start/game-start.component';
import { GameJoinComponent } from './game-join/game-join.component';
import { GameBestComponent } from './game-best/game-best.component';
import { GamePlayComponent } from './game-play/game-play.component';
import { GameConnectComponent } from './game-connect/game-connect.component';
import { ShipComponent } from './game-ship/ship.component';
import { GameDeployComponent } from './game-deploy/game-deploy-ships.component';
import { GameSpriteComponent } from './game-sprite/game-sprite.component';
import { GameRulesComponent } from './game-rules/game-rules.component';
import { GameChatComponent } from './game-chat/game-chat.component';
import { GameSetupComponent } from './game-setup/game-setup.component';

@NgModule({
  imports: [AppRoutingModule, BrowserModule, FormsModule, ReactiveFormsModule],
  declarations: [
    ShipComponent,
    GameDeployComponent,
    GameMenuComponent,
    GameMainComponent,
    GameStartComponent,
    GameJoinComponent,
    GameBestComponent,
    GamePlayComponent,
    GameConnectComponent,
    GameSpriteComponent,
    GameRulesComponent,
    GameChatComponent,
    GameSetupComponent,
  ],
  exports: [GameMenuComponent, GameMainComponent],
  providers: [],
})
export class GameModule {}
