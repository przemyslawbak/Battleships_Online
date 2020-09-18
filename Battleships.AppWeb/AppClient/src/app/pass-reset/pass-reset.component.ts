import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl, FormBuilder, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from "@angular/router";
import { HttpClient } from "@angular/common/http";
import { NgxSpinnerService } from "ngx-spinner";

import { ModalService } from '../services/modal.service';

import { PassResetModel } from "../models/password-reset.model";

@Component({
  templateUrl: './pass-reset.component.html',
  styleUrls: ['./pass-reset.component.css']
})
export class PassResetComponent implements OnInit {
  form: FormGroup;
  passModel: PassResetModel;
  constructor(private router: Router, private formBuilder: FormBuilder, private http: HttpClient, private route: ActivatedRoute, private spinner: NgxSpinnerService, private modalService: ModalService) {
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
    model.email = email;
    model.password = '';
    model.token = token.replace(/\$/g, '/');

    return model;
  }

  onSubmit() {
    this.spinner.show();
    this.passModel.password = this.form.value.Password;
    var url = 'http://localhost:50962/' + 'api/user/new-password';
    this.http.post(url, this.passModel)
      .subscribe(
        () => {
          this.modalService.open('info-modal', 'Now you can log in with your password.');
          this.spinner.hide();
          this.router.navigate(['join']);
        }
      );
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
