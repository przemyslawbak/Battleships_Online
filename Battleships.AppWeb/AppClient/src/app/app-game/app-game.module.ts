import { NgModule } from '@angular/core';
import { AppRoutingModule } from '../app-routing.module';

import { GameMenuComponent } from './game-menu/game-menu.component';
import { GameMainComponent } from './game-main/game-main.component';
import { GameStartComponent } from './game-start/game-start.component';
import { GameEnterComponent } from './game-enter/game-enter.component';
import { GameBestComponent } from './game-best/game-best.component';
import { GameShareComponent } from './game-share/game-share.component';

@NgModule({
  imports: [AppRoutingModule],
  declarations: [
    GameMenuComponent,
    GameMainComponent,
    GameStartComponent,
    GameEnterComponent,
    GameBestComponent,
    GameShareComponent,
  ],
  exports: [GameMenuComponent, GameMainComponent],
  providers: [],
})
export class GameModule {}
