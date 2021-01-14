import { HttpClient } from '@angular/common/http';
import { HttpService } from './http.service';

describe('HttpService', () => {
  let httpService: HttpService;
  let httpClientMock: HttpClient;

  beforeEach(() => {
    httpService = new HttpService(httpClientMock);
  });

  it('Service_ShouldBeCreated', () => {
    expect(httpService).toBeTruthy();
  });
});
