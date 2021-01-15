import { ModalService } from './modal.service';
import { TextService } from './text.service';

describe('ModalService', () => {
  let modalService: ModalService;
  let textService: TextService;

  beforeEach(() => {
    modalService = new ModalService(textService);
  });

  it('Service_ShouldBeCreated', () => {
    expect(modalService).toBeTruthy();
  });
});
