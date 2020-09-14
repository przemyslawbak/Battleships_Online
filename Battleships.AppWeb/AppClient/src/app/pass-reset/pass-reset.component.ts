import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl, FormBuilder, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from "@angular/router";
import { HttpClient } from "@angular/common/http";

import { PassResetModel } from "../models/pass.reset.model";

@Component({
  templateUrl: './pass-reset.component.html',
  styleUrls: ['./pass-reset.component.css']
})
export class PassResetComponent implements OnInit {
  form: FormGroup;
  passModel: PassResetModel;
  constructor(private router: Router, private formBuilder: FormBuilder, private http: HttpClient, private route: ActivatedRoute) {
    this.createForm();
  }

  createForm() {
    this.form = this.formBuilder.group({
      Password: ['', Validators.required],
      PasswordConfirm: ['', Validators.required]
    }, {
        validator: this.passwordConfirmValidator
      });
  }

  ngOnInit(): void {
    this.passModel = this.getPassResetModel();
  }

  getPassResetModel(): PassResetModel {
    const email = this.route.snapshot.paramMap.get('email');
    const token = this.route.snapshot.paramMap.get('token');

    var model = <PassResetModel>{};
    model.Email = email;
    model.Password = '';
    model.Token = token.replace(/\$/g, '/');

    return model;
  }

  onSubmit() {
    this.passModel.Password = this.form.value.Password;
    var url = 'http://localhost:50962/' + 'api/user/new-password';
    this.http.post(url, this.passModel)
      .subscribe(
        (val) => {
          console.log("POST call successful value returned in body", val);
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
