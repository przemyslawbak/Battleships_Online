import { Component, OnInit } from '@angular/core';
import {
  FormGroup,
  FormControl,
  FormBuilder,
  Validators,
} from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';

import { ModalService } from '@services/modal.service';

import { PassResetModel } from '@models/password-reset.model';
import { HttpService } from '@services/http.service';

@Component({
  templateUrl: './pass-reset.component.html',
  styleUrls: ['./pass-reset.component.css'],
})
export class PassResetComponent implements OnInit {
  public form: FormGroup;
  public passModel: PassResetModel;
  constructor(
    private router: Router,
    private formBuilder: FormBuilder,
    private http: HttpService,
    private route: ActivatedRoute,
    private modalService: ModalService
  ) {
    this.createForm();
  }

  public ngOnInit(): void {
    this.passModel = this.getPassResetModel();
  }

  public onSubmit() {
    this.passModel.password = this.form.value.Password;
    this.http.postNewPass(this.passModel).subscribe(() => {
      this.modalService.open(
        'info-modal',
        'Now you can log in with your password.'
      );
      this.router.navigate(['join-site']);
    });
  }

  public onBack() {
    this.router.navigate(['join-site']);
  }

  public hasError(name: string) {
    const e = this.getFormControl(name);
    return e && (e.dirty || e.touched) && !e.valid;
  }

  private createForm() {
    this.form = this.formBuilder.group(
      {
        Password: ['', Validators.required],
        PasswordConfirm: ['', Validators.required],
      },
      {
        validator: this.passwordConfirmValidator,
      }
    );
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

  private getFormControl(name: string) {
    return this.form.get(name);
  }

  private getPassResetModel(): PassResetModel {
    const email = this.route.snapshot.paramMap.get('email');
    const token = this.route.snapshot.paramMap.get('token');

    const model = {} as PassResetModel;
    model.email = email;
    model.password = '';
    model.token = token.replace(/\$/g, '/');

    return model;
  }
}
