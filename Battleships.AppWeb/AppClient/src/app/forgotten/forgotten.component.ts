import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Router } from "@angular/router";
import { HttpClient } from "@angular/common/http";
import { NgxSpinnerService } from "ngx-spinner";

import { ModalService } from '../modal';

import { PassResetEmail } from "../models/pass.reset";

@Component({
  selector: 'app-forgotten',
  templateUrl: './forgotten.component.html',
  styleUrls: ['./forgotten.component.css']
})
export class ForgottenComponent implements OnInit {
  form: FormGroup;
  constructor(private router: Router, private formBuilder: FormBuilder, private http: HttpClient, private spinner: NgxSpinnerService, private modalService: ModalService) {
    this.createForm();
  }

  public ngOnInit(): void {
  }

  public onSubmit() {
    this.spinner.show();
    var viewModel = <PassResetEmail>{};
    viewModel.email = this.form.value.Email;
    var url = 'http://localhost:50962/' + 'api/user/reset';
    this.http.post(url, viewModel)
      .subscribe(
        () => {
          this.modalService.open('info-modal', 'Password reset link has been sent to: ' + viewModel.email + '.');
          this.spinner.hide();
          this.router.navigate(['']);
        }
      );
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
