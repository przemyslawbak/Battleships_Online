import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ShipComponent } from './ship.component';

let component: ShipComponent;
let fixture: ComponentFixture<ShipComponent>;

describe('ShipComponent', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [],
      declarations: [ShipComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(ShipComponent);
    component = fixture.componentInstance;
  });

  it('Component_ShouldBeCreated', () => {
    expect(component).toBeTruthy();
  });
});
