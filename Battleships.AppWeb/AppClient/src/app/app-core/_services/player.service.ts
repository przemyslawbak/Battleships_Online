import { Injectable } from '@angular/core';
import { AuthService } from '@services/auth.service';

@Injectable()
export class PlayerService {
  constructor(public auth: AuthService) {}

  public getPlayerNumber(): number {
    return -1;
  }
}
