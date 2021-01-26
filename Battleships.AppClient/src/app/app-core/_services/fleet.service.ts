import { Injectable } from '@angular/core';

import { ShipComponent } from 'app/app-game/game-ship/ship.component';

@Injectable({ providedIn: 'root' })
export class FleetService {
  public fleetWaiting: ShipComponent[] = [];
  public fleetDeployed: ShipComponent[] = [];

  get getFleetWaiting(): ShipComponent[] {
    return this.fleetWaiting;
  }

  set setFleetWaiting(fleet: ShipComponent[]) {
    this.fleetWaiting = fleet;
  }

  get getFleetDeployed(): ShipComponent[] {
    return this.fleetDeployed;
  }

  set setFleetDeployed(fleet: ShipComponent[]) {
    this.fleetDeployed = fleet;
  }

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

  public updateOpponentsFleet(
    hit: boolean,
    possibleTargetsCount: number,
    mastCounter: number,
    opponentsFleet: number[]
  ): number[] {
    return !hit && possibleTargetsCount == 0 && mastCounter > 0
      ? this.removeShipFromArray(mastCounter, opponentsFleet, false)
      : opponentsFleet;
  }

  public removeShipFromArray(
    mastCounter: number,
    opponentsFleet: number[],
    haveShipsWithMoreMasts: boolean
  ): number[] {
    const index = opponentsFleet.indexOf(mastCounter);

    if (index > -1 && !haveShipsWithMoreMasts) {
      opponentsFleet.splice(index, 1);
    }

    return opponentsFleet;
  }

  public updateMastCounter(
    hit: boolean,
    possibleTargetsCount: number,
    mastCounter: number
  ): number {
    if (hit) {
      return mastCounter + 1;
    } else if (!hit && possibleTargetsCount == 0 && mastCounter > 0) {
      return 0;
    }

    return mastCounter;
  }

  public checkCounter(
    haveShipsWithMoreMasts: boolean,
    mastCounter: number
  ): number {
    return !haveShipsWithMoreMasts ? 0 : mastCounter;
  }

  public isPossibleMoreMasts(
    mastCounter: number,
    opponentsFleet: number[]
  ): boolean {
    let result: boolean = false;
    if (mastCounter > 0) {
      for (let i = 1; i < 4; i++) {
        if (opponentsFleet.indexOf(mastCounter + i) > -1) {
          result = true;
        }
      }
    }

    return result;
  }

  public getRandomRotationValue(random: boolean): number {
    return random ? 90 : 0;
  }

  //todo: test below

  public getShipListItem(
    name: string,
    id: string,
    fleetWaiting: ShipComponent[],
    fleetDeployed: ShipComponent[]
  ): ShipComponent {
    return name.split('-')[1] == 'fleetWaiting'
      ? fleetWaiting[+id]
      : fleetDeployed[+id];
  }

  public moveFromWaitingToDeployed(): void {
    this.fleetDeployed.push(this.fleetWaiting[0]);
    this.fleetWaiting.splice(0, 1);
  }
}
