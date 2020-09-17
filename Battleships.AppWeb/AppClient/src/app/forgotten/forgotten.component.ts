import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Router } from "@angular/router";
import { HttpClient } from "@angular/common/http";

import { ModalService } from '../services/modal.service';
import { NgxSpinnerService } from "ngx-spinner";
import { ReCaptchaV3Service } from 'ng-recaptcha';

import { PassResetEmail } from "../models/pass.reset";

@Component({
  selector: 'app-forgotten',
  templateUrl: './forgotten.component.html',
  styleUrls: ['./forgotten.component.css']
})
export class ForgottenComponent implements OnInit {
  public form: FormGroup;
  constructor(private router: Router, private formBuilder: FormBuilder, private http: HttpClient, private spinner: NgxSpinnerService, private modalService: ModalService, private recaptchaV3Service: ReCaptchaV3Service) {
    this.createForm();
  }

  public ngOnInit(): void {
  }

  private onSubmit(captchaToken: string) {
    this.spinner.show();
    let model = <PassResetEmail>{};
    model.email = this.form.value.Email;
    model.captchaToken = captchaToken;
    const url = 'http://localhost:50962/' + 'api/user/reset';
    this.http.post(url, model)
      .subscribe(
        () => {
          this.modalService.open('info-modal', 'Password reset link has been sent to: ' + model.email + '.');
          this.spinner.hide();
          this.router.navigate(['']);
        }
      );
  }

  public beforeSubmittingForm(): void {
    this.recaptchaV3Service.execute('formSubmit')
      .subscribe(
        (token) => {
          console.log('recaptcha v3 token: ' + token);
          this.onSubmit(token)
        },
        (error) => {
          console.log('recaptcha v3 error: ' + error);
        });
  }

  public hasError(name: string) {
    var e = this.getFormControl(name);
    return e && (e.dirty || e.touched) && !e.valid;
  }

  public  onBack() {
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
