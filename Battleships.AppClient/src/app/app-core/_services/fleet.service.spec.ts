import { FleetService } from './fleet.service';

describe('FleetService', () => {
  let fleetService: FleetService;

  beforeEach(() => {
    fleetService = new FleetService();
  });

  it('Service_ShouldBeCreated', () => {
    expect(fleetService).toBeTruthy();
  });

  //setup various scenarios for `removeShipFromArray`:
  [
    {
      fakeMastCount: 1,
      fakeFleet: [1, 2, 3, 4],
      haveShipsWithMoreMasts: true,
      resultLegth: 4,
      resultFleet: [1, 2, 3, 4],
    },
    {
      fakeMastCount: 1,
      fakeFleet: [2, 3, 4],
      haveShipsWithMoreMasts: false,
      resultLegth: 3,
      resultFleet: [2, 3, 4],
    },
    {
      fakeMastCount: 1,
      fakeFleet: [1, 2, 3, 4],
      haveShipsWithMoreMasts: false,
      resultLegth: 3,
      resultFleet: [2, 3, 4],
    },
  ].forEach(
    ({
      fakeMastCount,
      fakeFleet,
      haveShipsWithMoreMasts,
      resultLegth,
      resultFleet,
    }) => {
      it(`'removeShipFromArray_OnVariousParameterValues_Masts:${fakeMastCount}-haveShipsWithMoreMasts:${haveShipsWithMoreMasts}_ShouldReturnCorrectResult_Legth:${resultLegth}`, () => {
        let result: number[] = fleetService.removeShipFromArray(
          fakeMastCount,
          fakeFleet,
          haveShipsWithMoreMasts
        );

        expect(result.length).toBe(resultLegth);
        expect(result).toEqual(resultFleet);
      });
    }
  );

  //setup various scenarios for `updateOpponentsFleet`:
  [
    {
      fakeHit: true,
      fakePossibleTargetsCount: 0,
      fakeMastCount: 1,
      fakeFleet: [1, 2, 3, 4],
      resultLegth: 4,
      resultFleet: [1, 2, 3, 4],
    },
    {
      fakeHit: false,
      fakePossibleTargetsCount: 1,
      fakeMastCount: 1,
      fakeFleet: [1, 2, 3, 4],
      resultLegth: 4,
      resultFleet: [1, 2, 3, 4],
    },
    {
      fakeHit: false,
      fakePossibleTargetsCount: 0,
      fakeMastCount: 0,
      fakeFleet: [1, 2, 3, 4],
      resultLegth: 4,
      resultFleet: [1, 2, 3, 4],
    },
    {
      fakeHit: false,
      fakePossibleTargetsCount: 0,
      fakeMastCount: 1,
      fakeFleet: [1, 2, 3, 4],
      resultLegth: 3,
      resultFleet: [2, 3, 4],
    },
    {
      fakeHit: false,
      fakePossibleTargetsCount: 0,
      fakeMastCount: 1,
      fakeFleet: [2, 3, 4],
      resultLegth: 3,
      resultFleet: [2, 3, 4],
    },
  ].forEach(
    ({
      fakeHit,
      fakePossibleTargetsCount,
      fakeMastCount,
      fakeFleet,
      resultLegth,
      resultFleet,
    }) => {
      it(`'updateOpponentsFleet_OnVariousParameterValues_Hit:${fakeHit}-Targets:${fakePossibleTargetsCount}-Masts:${fakeMastCount}_ShouldReturnCorrectResult_Legth:${resultLegth}`, () => {
        let result: number[] = fleetService.updateOpponentsFleet(
          fakeHit,
          fakePossibleTargetsCount,
          fakeMastCount,
          fakeFleet
        );

        expect(result.length).toBe(resultLegth);
        expect(result).toEqual(resultFleet);
      });
    }
  );

  it('updateMastCounter_OnHit_ReturnsGreaterMastCount', () => {
    let hit: boolean = true;
    let possibleTargetsCount: number = 0;
    let mastCounter: number = 3;

    let result: number = fleetService.updateMastCounter(
      hit,
      possibleTargetsCount,
      mastCounter
    );

    expect(result).toBe(mastCounter + 1);
  });

  it('updateMastCounter_OnNotHitButWrongTargetsCount_ReturnsUnchangedMastCount', () => {
    let hit: boolean = false;
    let possibleTargetsCount: number = 1;
    let mastCounter: number = 3;

    let result: number = fleetService.updateMastCounter(
      hit,
      possibleTargetsCount,
      mastCounter
    );

    expect(result).toBe(mastCounter);
  });

  it('updateMastCounter_OnNotHitButMastCountZero_ReturnsUnchangedMastCount', () => {
    let hit: boolean = false;
    let possibleTargetsCount: number = 0;
    let mastCounter: number = 0;

    let result: number = fleetService.updateMastCounter(
      hit,
      possibleTargetsCount,
      mastCounter
    );

    expect(result).toBe(mastCounter);
  });

  it('updateMastCounter_OnNotHitAndPossibleTargetCountZeroAndMastCountGreaterThanZero_ReturnsZero', () => {
    let hit: boolean = false;
    let possibleTargetsCount: number = 0;
    let mastCounter: number = 3;

    let result: number = fleetService.updateMastCounter(
      hit,
      possibleTargetsCount,
      mastCounter
    );

    expect(result).toBe(0);
  });

  it('checkCounter_OnhaveShipsWithMoreMastsTrue_ReturnsSameMastCounter', () => {
    let haveShipsWithMoreMasts: boolean = true;
    let mastCounter: number = 2;

    let result: number = fleetService.checkCounter(
      haveShipsWithMoreMasts,
      mastCounter
    );

    expect(result).toBe(2);
  });

  it('checkCounter_OnhaveShipsWithMoreMastsFalse_ReturnsZero', () => {
    let haveShipsWithMoreMasts: boolean = false;
    let mastCounter: number = 2;

    let result: number = fleetService.checkCounter(
      haveShipsWithMoreMasts,
      mastCounter
    );

    expect(result).toBe(0);
  });

  it('isPossibleMoreMasts_OnMastCounterZero_ReturnsFalse', () => {
    let mastCounter: number = 0;
    let opponentsFleet: number[] = [1, 2, 3, 4];

    let result: boolean = fleetService.isPossibleMoreMasts(
      mastCounter,
      opponentsFleet
    );

    expect(result).toBe(false);
  });

  it('isPossibleMoreMasts_OnMastCounterGreaterThanZeroAndHavingMoreMasts_ReturnsTrue', () => {
    let mastCounter: number = 1;
    let opponentsFleet: number[] = [2, 3, 4];

    let result: boolean = fleetService.isPossibleMoreMasts(
      mastCounter,
      opponentsFleet
    );

    expect(result).toBe(true);
  });

  it('isPossibleMoreMasts_OnMastCounterGreaterThanZeroAndNotHavingMoreMasts_ReturnsFalse', () => {
    let mastCounter: number = 3;
    let opponentsFleet: number[] = [1, 2, 3];

    let result: boolean = fleetService.isPossibleMoreMasts(
      mastCounter,
      opponentsFleet
    );

    expect(result).toBe(false);
  });

  it('isPossibleMoreMasts_OnMastCounterFour_ReturnsFalse', () => {
    let mastCounter: number = 4;
    let opponentsFleet: number[] = [1, 2, 3, 4];

    let result: boolean = fleetService.isPossibleMoreMasts(
      mastCounter,
      opponentsFleet
    );

    expect(result).toBe(false);
  });

  it('getRandomRotationValue_OnParameterValue_ReturnsCorrectNumber', () => {
    let shouldBe90: number = fleetService.getRandomRotationValue(true);
    let shouldBe0: number = fleetService.getRandomRotationValue(false);

    expect(shouldBe90).toBe(90);
    expect(shouldBe0).toBe(0);
  });
});
