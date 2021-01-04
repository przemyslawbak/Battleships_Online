import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { NgxSpinnerService } from 'ngx-spinner';
import { catchError, timeout } from 'rxjs/operators';
import { ModalService } from '@services/modal.service';

@Injectable()
export class HttpService {
  private result: any;
  constructor(
    private http: HttpClient,
    private spinner: NgxSpinnerService,
    private modalService: ModalService
  ) {}

  public getData(url: string): Observable<any> {
    this.spinner.show();
    this.result = this.getResult(url);
    this.spinner.hide();
    return this.result;
  }

  private getResult(url: string): Observable<any> {
    return this.http.get<any>(url).pipe(
      timeout(10000),
      catchError((e) => {
        this.modalService.open('info-modal', 'Connection time out.');
        return of(null);
      })
    );
  }
}
