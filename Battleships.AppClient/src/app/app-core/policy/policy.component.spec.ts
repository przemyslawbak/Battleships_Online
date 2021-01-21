import { PolicyComponent } from './policy.component';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';

let component: PolicyComponent;
let fixture: ComponentFixture<PolicyComponent>;
const routerMock = jasmine.createSpyObj('Router', ['navigate']);

describe('PolicyComponent', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [PolicyComponent],
      providers: [{ provide: Router, useValue: routerMock }],
    }).compileComponents();

    fixture = TestBed.createComponent(PolicyComponent);
    component = fixture.componentInstance;
  });

  it('Component_ShouldBeCreated', () => {
    expect(component).toBeTruthy();
  });
});
