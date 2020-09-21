import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Router } from "@angular/router";
import { HttpClient } from "@angular/common/http";
import { environment } from '../../environments/environment';

import { ModalService } from '../services/modal.service';
import { NgxSpinnerService } from "ngx-spinner";
import { ReCaptchaV3Service } from 'ng-recaptcha';

import { PassForgottenModel } from "../models/password-forgotten.model";

@Component({
  selector: 'app-forgotten',
  templateUrl: './forgotten.component.html',
  styleUrls: ['./forgotten.component.css']
})
export class ForgottenComponent {
  public form: FormGroup;
  constructor(private router: Router, private formBuilder: FormBuilder, private http: HttpClient, private spinner: NgxSpinnerService, private modalService: ModalService, private recaptchaV3Service: ReCaptchaV3Service) {
    this.createForm();
  }

  private onSubmit(captchaToken: string) {
    let model = <PassForgottenModel>{};
    model.email = this.form.value.Email;
    model.captchaToken = captchaToken;
    const url = environment.apiUrl + 'api/user/reset';
    this.http.post(url, model)
      .subscribe(() => {
          this.modalService.open('info-modal', 'Password reset link has been sent to: ' + model.email + '.');
          this.spinner.hide();
          this.router.navigate(['']);
        }
      );
  }

  public beforeSubmittingForm(): void {
    this.spinner.show();
    this.recaptchaV3Service.execute('formSubmit')
      .subscribe(
        (token) => {
          this.onSubmit(token)
        });
  }

  public hasError(name: string) {
    let e = this.getFormControl(name);
    return e && (e.dirty || e.touched) && !e.valid;
  }

  public onBack() {
    this.router.navigate(["join"]);
  }

  private getFormControl(name: string) {
    return this.form.get(name);
  }

  private createForm() {
    this.form = this.formBuilder.group({
      Email: ['',
        [Validators.required,
        Validators.email]
      ]
    });
  }
}
