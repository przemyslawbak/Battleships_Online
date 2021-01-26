import { Component } from '@angular/core';
import {
  FormGroup,
  FormControl,
  FormBuilder,
  Validators,
} from '@angular/forms';
import { Router } from '@angular/router';

import { ReCaptchaV3Service } from 'ng-recaptcha';
import { SecurityService } from '@services/security.service';

import { NewUser } from '@models/new-user.model';
import { AuthService } from '@services/auth.service';
import { HttpService } from '@services/http.service';

@Component({
  templateUrl: './user-register.component.html',
  styleUrls: ['./user-register.component.css'],
})
export class RegisterComponent {
  public form: FormGroup;
  constructor(
    private router: Router,
    private formBuilder: FormBuilder,
    private http: HttpService,
    private auth: AuthService,
    private recaptchaV3Service: ReCaptchaV3Service,
    private securityService: SecurityService
  ) {
    this.createForm();
  }

  public isValid(name: string) {
    const e = this.getFormControl(name);
    return e && e.valid;
  }

  public isChanged(name: string) {
    const e = this.getFormControl(name);
    return e && (e.dirty || e.touched);
  }

  public hasError(name: string) {
    const e = this.getFormControl(name);
    return e && (e.dirty || e.touched) && !e.valid;
  }

  public beforeSubmittingForm(): void {
    this.recaptchaV3Service.execute('formSubmit').subscribe((token) => {
      this.onSubmit(token);
    });
  }

  public onBack() {
    this.router.navigate(['join-site']);
  }

  public getFormControl(name: string) {
    return this.form.get(name);
  }

  private onRegisteredLogin(model: NewUser) {
    this.auth.login(model.email, model.password).subscribe(() => {
      this.router.navigate(['']);
    });
  }

  private passwordConfirmValidator(control: FormControl): any {
    const p = control.root.get('Password');
    const pc = control.root.get('PasswordConfirm');
    if (p && pc) {
      if (p.value !== pc.value) {
        pc.setErrors({ PasswordMismatch: true });
      } else {
        pc.setErrors(null);
      }
    }
    return null;
  }

  private createForm() {
    this.form = this.formBuilder.group(
      {
        Email: ['', [Validators.required, Validators.email]],
        Password: ['', Validators.required],
        PasswordConfirm: ['', Validators.required],
        DisplayName: ['', Validators.required],
      },
      {
        validator: this.passwordConfirmValidator,
      }
    );
  }

  private onSubmit(token: string) {
    const model = {} as NewUser;
    model.displayName = this.form.value.DisplayName;
    model.email = this.form.value.Email;
    model.password = this.form.value.Password;
    model.username = this.form.value.DisplayName;
    model.captchaToken = token;
    this.http.postNewUser(model).subscribe(() => {
      this.onRegisteredLogin(model);
      this.securityService.delayForBruteForce(10);
    });
  }
}
