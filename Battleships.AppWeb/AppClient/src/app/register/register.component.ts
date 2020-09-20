import { Component } from "@angular/core";
import { FormGroup, FormControl, FormBuilder, Validators } from '@angular/forms';
import { Router } from "@angular/router";
import { HttpClient } from "@angular/common/http";

import { ReCaptchaV3Service } from 'ng-recaptcha';
import { NgxSpinnerService } from "ngx-spinner";
import { SecurityService } from "../services/security.service";

import { NewUser } from "../models/new-user.model";
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css']
})
export class RegisterComponent {
  form: FormGroup;
  constructor(private router: Router, private formBuilder: FormBuilder, private http: HttpClient, private auth: AuthService, private spinner: NgxSpinnerService, private recaptchaV3Service: ReCaptchaV3Service, private securityService: SecurityService) {

    // initialize the form
    this.createForm();
  }

  public isValid(name: string) {
    var e = this.getFormControl(name);
    return e && e.valid;
  }

  public isChanged(name: string) {
    var e = this.getFormControl(name);
    return e && (e.dirty || e.touched);
  }

  public hasError(name: string) {
    var e = this.getFormControl(name);
    return e && (e.dirty || e.touched) && !e.valid;
  }

  public beforeSubmittingForm(): void {
    this.spinner.show();
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

  public onBack() {
    this.router.navigate(["join"]);
  }

  public getFormControl(name: string) {
    return this.form.get(name);
  }

  private onRegisteredLogin(model: NewUser) {
    this.auth.login(model.email, model.password)
      .subscribe(() => {
        this.router.navigate(['']);
      },
        err => {
          console.log(err)
          this.form.setErrors({
            "auth": "Incorrect username or password"
          });
        });
  }

  private passwordConfirmValidator(control: FormControl): any {
    let p = control.root.get('Password');
    let pc = control.root.get('PasswordConfirm');
    if (p && pc) {
      if (p.value !== pc.value) {
        pc.setErrors(
          { 'PasswordMismatch': true }
        );
      }
      else {
        pc.setErrors(null);
      }
    }
    return null;
  }

  private createForm() {
    this.form = this.formBuilder.group({
      Email: ['',
        [Validators.required,
        Validators.email]
      ],
      Password: ['', Validators.required],
      PasswordConfirm: ['', Validators.required],
      DisplayName: ['', Validators.required]
    }, {
      validator: this.passwordConfirmValidator
    });
  }

  private onSubmit(token: string) {
    var model = <NewUser>{};
    model.displayName = this.form.value.DisplayName;
    model.email = this.form.value.Email;
    model.password = this.form.value.Password;
    model.username = this.form.value.DisplayName;
    model.captchaToken = token;
    var url = 'http://localhost:50962/' + 'api/user/register';
    this.securityService.delayForBruteForce(5);
    console.log('recaptcha v3 token: ' + model.captchaToken);
    this.http.post(url, model)
      .subscribe(
        () => {
          this.onRegisteredLogin(model);
          this.spinner.hide();
        }
      );
  }
}
