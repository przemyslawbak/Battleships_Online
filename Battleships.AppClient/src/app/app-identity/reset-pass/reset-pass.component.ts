import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';

import { ModalService } from '@services/modal.service';
import { ReCaptchaV3Service } from 'ng-recaptcha';

import { PassForgottenModel } from '@models/password-forgotten.model';
import { HttpService } from '@services/http.service';

@Component({
  templateUrl: './reset-pass.component.html',
  styleUrls: ['./reset-pass.component.css'],
})
export class ForgottenComponent implements OnInit {
  public form: FormGroup;
  constructor(
    private router: Router,
    private formBuilder: FormBuilder,
    private http: HttpService,
    private modalService: ModalService,
    private recaptchaV3Service: ReCaptchaV3Service
  ) {}

  ngOnInit(): void {
    this.createForm();
  }

  private onSubmit(captchaToken: string) {
    const model = {} as PassForgottenModel;
    model.email = this.form.value.Email;
    model.captchaToken = captchaToken;
    this.http.postPassForgottenData(model).subscribe(() => {
      this.modalService.open(
        'info-modal',
        'Password reset link has been sent to: ' + model.email + '.'
      );
      this.router.navigate(['']);
    });
  }

  public beforeSubmittingForm(): void {
    this.recaptchaV3Service.execute('formSubmit').subscribe((token) => {
      this.onSubmit(token);
    });
  }

  public onBack() {
    this.router.navigate(['join-site']);
  }

  private getFormControl(name: string) {
    return this.form.get(name);
  }

  private createForm() {
    this.form = this.formBuilder.group({
      Email: ['', [Validators.required, Validators.email]],
    });
  }

  public hasError(name: string) {
    const e = this.getFormControl(name);
    return e && (e.dirty || e.touched) && !e.valid;
  }
}
