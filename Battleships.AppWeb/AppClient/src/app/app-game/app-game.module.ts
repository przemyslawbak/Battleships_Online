import { NgModule } from '@angular/core';

import { GameMenuComponent } from './game-menu/game-menu.component';
import { GameMainComponent } from './game-main/game-main.component';

@NgModule({
  imports: [],
  declarations: [GameMenuComponent, GameMainComponent],
  exports: [GameMenuComponent, GameMainComponent],
  providers: [],
})
export class GameModule {}
