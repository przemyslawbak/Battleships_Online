import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Router } from "@angular/router";
import { HttpClient } from "@angular/common/http";
import { NgxSpinnerService } from "ngx-spinner";

import { PassResetEmail } from "../models/pass.reset";

@Component({
  selector: 'app-forgotten',
  templateUrl: './forgotten.component.html',
  styleUrls: ['./forgotten.component.css']
})
export class ForgottenComponent implements OnInit {
  form: FormGroup;
  constructor(private router: Router, private formBuilder: FormBuilder, private http: HttpClient, private spinner: NgxSpinnerService) {
    this.createForm();
  }

  createForm() {
    this.form = this.formBuilder.group({
      Email: ['',
        [Validators.required,
        Validators.email]
      ]
      });
  }

  ngOnInit(): void {
  }

  onSubmit() {
    this.spinner.show();
    var viewModel = <PassResetEmail>{};
    viewModel.email = this.form.value.Email;
    var url = 'http://localhost:50962/' + 'api/user/reset';
    this.http.post(url, viewModel)
      .subscribe();
  }

  onBack() {
    this.router.navigate(["join"]);
  }

  getFormControl(name: string) {
    return this.form.get(name);
  }

  hasError(name: string) {
    var e = this.getFormControl(name);
    return e && (e.dirty || e.touched) && !e.valid;
  }
}
