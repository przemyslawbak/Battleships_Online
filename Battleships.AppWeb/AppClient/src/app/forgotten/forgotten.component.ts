import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl, FormBuilder, Validators } from '@angular/forms';
import { Router } from "@angular/router";
import { HttpClient } from "@angular/common/http";

import { PassReset } from "../models/pass.reset";

@Component({
  selector: 'app-forgotten',
  templateUrl: './forgotten.component.html',
  styleUrls: ['./forgotten.component.css']
})
export class ForgottenComponent implements OnInit {
  form: FormGroup;
  constructor(private router: Router, private formBuilder: FormBuilder, private http: HttpClient,) {
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
    }, {
        validator: this.passwordConfirmValidator
      });
  }

  ngOnInit(): void {
  }

  onSubmit() {
    var viewModel = <PassReset>{};
    viewModel.Email = this.form.value.Email;
    var url = 'http://localhost:50962/' + 'api/user/reset';
    this.http.post(url, viewModel)
      .subscribe(
        (val) => {
          console.log("POST call successful value returned in body", val); viewModel
          this.router.navigate(['']);
        },
        response => {
          console.log("POST call in error", response);
          //todo: popup
        },
        () => {
          console.log("The POST observable is now completed.");
          //todo: popup
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

  getFormControl(name: string) {
    return this.form.get(name);
  }

  hasError(name: string) {
    var e = this.getFormControl(name);
    return e && (e.dirty || e.touched) && !e.valid;
  }
}
