import { TestBed } from '@angular/core/testing';
import { BoardCell } from '@models/board-cell.model';
import { AiService } from '@services/ai.service';
import { ShipComponent } from 'app/app-game/game-ship/ship.component';

describe('AiService', () => {
  let aiService: AiService;
  const boardServiceMock = jasmine.createSpyObj('BoardService', [
    'getAllForbiddenCells',
    'getPotentialTargets',
    'updateCellsToBeAvoided',
    'getShootingCoordinates',
    'getAutoDeployCoordinates',
    'deployShipOnBoard',
    'resetEmptyCellsColors',
    'getEmptyBoard',
  ]);
  const fleetServiceMock = jasmine.createSpyObj('FleetService', [
    'updateOpponentsFleet',
    'updateMastCounter',
    'isPossibleMoreMasts',
    'removeShipFromArray',
    'checkCounter',
    'getRandomRotationValue',
    'moveFromWaitingToDeployed',
    'createFleet',
  ]);
  const randomizerService = jasmine.createSpyObj('RandomizerService', [
    'randomHalf',
  ]);

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [],
      providers: [],
    });
    aiService = new AiService(
      boardServiceMock,
      fleetServiceMock,
      randomizerService
    );
    fleetServiceMock.moveFromWaitingToDeployed.calls.reset();
    boardServiceMock.resetEmptyCellsColors.calls.reset();
    randomizerService.randomHalf.calls.reset();
  });

  it('Service_ShouldBeCreated', () => {
    expect(aiService).toBeTruthy();
  });

  it('autoDeploy_OnDeploymentNotAllowed_NeverCallsServiceMethods', () => {
    let board: BoardCell[][] = [[]];
    let fleetWaiting: ShipComponent[] = [];
    let computersFleet: boolean = true;
    let isDeploymentAllowed: boolean = false;
    aiService.autoDeploy(
      board,
      fleetWaiting,
      computersFleet,
      isDeploymentAllowed
    );

    expect(fleetServiceMock.moveFromWaitingToDeployed).toHaveBeenCalledTimes(0);
    expect(boardServiceMock.resetEmptyCellsColors).toHaveBeenCalledTimes(0);
    expect(randomizerService.randomHalf).toHaveBeenCalledTimes(0);
  });

  it('autoDeploy_OnEmptyFleetArrayAndComputersFleet_NeverCallsServiceMethods', () => {
    let board: BoardCell[][] = [[]];
    let fleetWaiting: ShipComponent[] = [];
    let computersFleet: boolean = true;
    let isDeploymentAllowed: boolean = true;
    aiService.autoDeploy(
      board,
      fleetWaiting,
      computersFleet,
      isDeploymentAllowed
    );

    expect(fleetServiceMock.moveFromWaitingToDeployed).toHaveBeenCalledTimes(0);
    expect(boardServiceMock.resetEmptyCellsColors).toHaveBeenCalledTimes(0);
    expect(randomizerService.randomHalf).toHaveBeenCalledTimes(0);
  });

  it('autoDeploy_OnEmptyFleetArrayAndPlayersFleet_ResetsCellsColors', () => {
    let board: BoardCell[][] = [[]];
    let fleetWaiting: ShipComponent[] = [];
    let computersFleet: boolean = false;
    let isDeploymentAllowed: boolean = true;
    aiService.autoDeploy(
      board,
      fleetWaiting,
      computersFleet,
      isDeploymentAllowed
    );

    expect(fleetServiceMock.moveFromWaitingToDeployed).toHaveBeenCalledTimes(0);
    expect(boardServiceMock.resetEmptyCellsColors).toHaveBeenCalledTimes(1);
    expect(randomizerService.randomHalf).toHaveBeenCalledTimes(0);
  });

  it('autoDeploy_OnOneShipInFleetArray_ReseMovesShipsBetweenArraysOnce', () => {
    let board: BoardCell[][] = [[]];
    let fleetWaiting: ShipComponent[] = [{} as ShipComponent];
    let computersFleet: boolean = true;
    let isDeploymentAllowed: boolean = true;
    aiService.autoDeploy(
      board,
      fleetWaiting,
      computersFleet,
      isDeploymentAllowed
    );

    expect(fleetServiceMock.moveFromWaitingToDeployed).toHaveBeenCalledTimes(0);
    expect(boardServiceMock.resetEmptyCellsColors).toHaveBeenCalledTimes(0);
    expect(randomizerService.randomHalf).toHaveBeenCalledTimes(1);
  });
});
