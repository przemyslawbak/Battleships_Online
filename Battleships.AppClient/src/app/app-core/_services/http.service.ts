import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, Subject } from 'rxjs';
import { environment } from '@environments/environment';
import { GameState } from '@models/game-state.model';
import { EditUser } from '@models/edit-user.model';
import { PassResetModel } from '@models/password-reset.model';
import { PassForgottenModel } from '@models/password-forgotten.model';
import { NewUser } from '@models/new-user.model';

@Injectable()
export class HttpService {
  constructor(private http: HttpClient) {}

  public postRevokeData(data: {
    UserName: string;
    RefreshToken: string;
    Token: string;
  }) {
    const url = environment.apiUrl + 'api/token/revoke-token';
    this.http.post(url, data);
  }

  public postLoginResponse(url: string, data: any): Observable<any> {
    let subject = new Subject<any>();
    this.http.post<any>(url, data).subscribe((res) => subject.next(res));

    return subject.asObservable();
  }

  public postWinner(data: { UserName: string; Multiplayer: boolean }) {
    const url = environment.apiUrl + 'api/user/winner';
    this.http.post(url, data);
  }

  public postGameState(model: GameState): Observable<any> {
    const url = environment.apiUrl + 'api/game/start';
    let subject = new Subject<any>();
    this.http.post<any>(url, model).subscribe((res) => subject.next(res));

    return subject.asObservable();
  }

  public postUpdatedUser(model: EditUser): Observable<any> {
    const url = environment.apiUrl + 'api/user/edit';
    let subject = new Subject<any>();
    this.http.post<any>(url, model).subscribe((res) => subject.next(res));

    return subject.asObservable();
  }

  public postNewPass(model: PassResetModel): Observable<any> {
    const url = environment.apiUrl + 'api/user/new-password';
    let subject = new Subject<any>();
    this.http.post<any>(url, model).subscribe((res) => subject.next(res));

    return subject.asObservable();
  }

  public postPassForgottenData(model: PassForgottenModel): Observable<any> {
    const url = environment.apiUrl + 'api/user/reset';
    let subject = new Subject<any>();
    this.http.post<any>(url, model).subscribe((res) => subject.next(res));

    return subject.asObservable();
  }

  public postNewUser(model: NewUser): Observable<any> {
    const url = environment.apiUrl + 'api/user/register';
    let subject = new Subject<any>();
    this.http.post<any>(url, model).subscribe((res) => subject.next(res));

    return subject.asObservable();
  }

  public getBestPlayers(): Observable<any> {
    const url = environment.apiUrl + 'api/user/best';
    return this.http.get(url);
  }

  public getGameState(id: string): Observable<any> {
    const url: string = environment.apiUrl + 'api/game/join?id=' + id;
    return this.http.get(url);
  }

  public getOpenGames() {
    const url = environment.apiUrl + 'api/game/open';
    return this.http.get(url);
  }
}
