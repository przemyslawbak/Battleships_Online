import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ModalService } from '@services/modal.service';
import { ModalComponent } from './modal-views.component';

const modalServiceMock = jasmine.createSpyObj('ServiceMock', ['add', 'remove']);
let component: ModalComponent;
let fixture: ComponentFixture<ModalComponent>;

describe('FooterComponent', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [{ provide: ModalService, useValue: modalServiceMock }],
      declarations: [ModalComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(ModalComponent);
    component = fixture.componentInstance;
  });

  it('Component_ShouldBeCreated', () => {
    expect(component).toBeTruthy();
  });
});
