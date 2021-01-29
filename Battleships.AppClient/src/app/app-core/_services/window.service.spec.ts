import { WindowService } from './window.service';
import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { ModalService } from './modal.service';
import { SignalRService } from './signal-r.service';
import { AuthService } from './auth.service';

describe('WindowService', () => {
  let service: WindowService;
  const modalServiceMock = jasmine.createSpyObj('ModalService', ['open']);
  const routerMock = jasmine.createSpyObj('Router', ['navigate']);
  const authServiceMock = jasmine.createSpyObj('AuthService', ['getAuth']);

  beforeEach(() => {
    service = new WindowService(authServiceMock, routerMock, modalServiceMock);
  });

  it('Service_ShouldBeCreated', () => {
    expect(service).toBeTruthy();
  });
});
