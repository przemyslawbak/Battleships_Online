import { TestBed } from '@angular/core/testing';
import { ModalComponent } from '../modal-views/modal-views.component';
import { ModalService } from './modal.service';
import { TextService } from './text.service';

describe('ModalService', () => {
  let modalService: ModalService;
  let textService: TextService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ModalComponent],
      imports: [],
      providers: [],
    });
    modalService = new ModalService(textService);
  });

  it('Service_ShouldBeCreated', () => {
    expect(modalService).toBeTruthy();
  });
});
