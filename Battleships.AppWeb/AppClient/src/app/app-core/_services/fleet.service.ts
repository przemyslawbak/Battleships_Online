import { Injectable } from '@angular/core';
import { ShipComponent } from 'app/app-game/game-ship/ship.component';

@Injectable()
export class FleetService {
  public createFleet(): Array<ShipComponent> {
    return [
      { size: 4, rotation: 0 },
      { size: 3, rotation: 0 },
      { size: 3, rotation: 0 },
      { size: 2, rotation: 0 },
      { size: 2, rotation: 0 },
      { size: 2, rotation: 0 },
      { size: 1, rotation: 0 },
      { size: 1, rotation: 0 },
      { size: 1, rotation: 0 },
      { size: 1, rotation: 0 },
    ];
  }
}
