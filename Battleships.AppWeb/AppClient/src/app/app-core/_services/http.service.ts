import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { NgxSpinnerService } from 'ngx-spinner';

@Injectable()
export class HttpService {
  private result: any;
  constructor(private http: HttpClient, private spinner: NgxSpinnerService) {}

  public getData(url: string): Observable<any> {
    this.spinner.show();
    this.result = this.getResult(url);
    this.spinner.hide();
    return this.result;
  }

  public postData(url: string, data: any): Observable<any> {
    this.result = this.postResult(url, data);
    this.spinner.hide();
    return this.result;
  }

  private postResult(url: string, data: any): Observable<any> {
    return this.http.post<any>(url, data);
  }

  private getResult(url: string): Observable<any> {
    return this.http.get<any>(url);
  }
}
