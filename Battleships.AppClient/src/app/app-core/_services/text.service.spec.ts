import { HttpErrorResponse } from '@angular/common/http';
import { PlayerService } from '@services/player.service';
import { TextService } from './text.service';

describe('TextService', () => {
  let textService: TextService;

  beforeEach(() => {
    textService = new TextService();
  });

  it('Service_ShouldBeCreated', () => {
    expect(textService).toBeTruthy();
  });

  it('getErrorMessageText_OnErrorStatus_ReturnsCorrectString', () => {
    let error: HttpErrorResponse;

    error = new HttpErrorResponse({ status: 400 });
    expect(textService.getErrorMessageText(error)).toBe('Bad Request.');

    error = new HttpErrorResponse({ status: 404 });
    expect(textService.getErrorMessageText(error)).toBe(
      'The requested resource does not exist.'
    );

    error = new HttpErrorResponse({ status: 412 });
    expect(textService.getErrorMessageText(error)).toBe('Precondition Failed.');

    error = new HttpErrorResponse({ status: 500 });
    expect(textService.getErrorMessageText(error)).toBe(
      'Internal Server Error.'
    );

    error = new HttpErrorResponse({ status: 503 });
    expect(textService.getErrorMessageText(error)).toBe(
      'The requested service is not available.'
    );

    error = new HttpErrorResponse({ status: 422 });
    expect(textService.getErrorMessageText(error)).toBe('Validation Error.');

    error = new HttpErrorResponse({ status: 5000 });
    expect(textService.getErrorMessageText(error)).toBe(
      'Unknown error. Please try again.'
    );
  });
});
