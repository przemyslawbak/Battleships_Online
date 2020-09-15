import { Component } from "@angular/core";
import { FormGroup, FormControl, FormBuilder, Validators } from '@angular/forms';
import { Router } from "@angular/router";
import { HttpClient } from "@angular/common/http";
import { NgxSpinnerService } from "ngx-spinner";

import { User } from "../models/user";
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css']
})
export class RegisterComponent {
  form: FormGroup;
  constructor(private router: Router, private formBuilder: FormBuilder, private http: HttpClient, private auth: AuthService, private spinner: NgxSpinnerService) {

    // initialize the form
    this.createForm();
  }
  createForm() {
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
  onSubmit() {
    this.spinner.show();
    var tempUser = <User>{};
    tempUser.displayName = this.form.value.DisplayName;
    tempUser.email = this.form.value.Email;
    tempUser.password = this.form.value.Password;
    tempUser.username = this.form.value.DisplayName;
    var url = 'http://localhost:50962/' + 'api/user/register';
    this.http.post(url, tempUser)
      .subscribe(
        () => {
          this.spinner.hide();
        }
      );
  }

  onRegisteredLogin(tempUser: User) {
    this.auth.login(tempUser.email, tempUser.password)
      .subscribe(() => {
        this.router.navigate(['']);
      },
        err => {
          // login failed
          console.log(err)
          this.form.setErrors({
            "auth": "Incorrect username or password"
          });
        });
  }

  onBack() {
    this.router.navigate(["join"]);
  }
  passwordConfirmValidator(control: FormControl): any {
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
  // retrieve a FormControl
  getFormControl(name: string) {
    return this.form.get(name);
  }
  // returns TRUE if the FormControl is valid
  isValid(name: string) {
    var e = this.getFormControl(name);
    return e && e.valid;
  }
  // returns TRUE if the FormControl has been changed
  isChanged(name: string) {
    var e = this.getFormControl(name);
    return e && (e.dirty || e.touched);
  }
  // returns TRUE if the FormControl is invalid after user changes
  hasError(name: string) {
    var e = this.getFormControl(name);
    return e && (e.dirty || e.touched) && !e.valid;
  }
}
