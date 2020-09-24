import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';

import { AuthService } from '@services/auth.service';
@Component({
  selector: 'join',
  templateUrl: './user-join.component.html',
  styleUrls: ['./user-join.component.css'],
})
export class JoinComponent implements OnInit {
  title: string;
  form: FormGroup;
  constructor(
    private router: Router,
    private formBuilder: FormBuilder,
    private authService: AuthService
  ) {
    this.createForm();
  }

  public ngOnInit() {
    if (this.authService.isLoggedIn()) {
      this.router.navigate(['']);
    }
  }

  public onSubmit() {
    const email = this.form.value.Email;
    const password = this.form.value.Password;
    this.authService.login(email, password).subscribe(() => {
      this.router.navigate(['']);
    });
  }

  public onBack() {
    this.router.navigate(['']);
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

  private getFormControl(name: string) {
    return this.form.get(name);
  }

  private createForm() {
    this.form = this.formBuilder.group({
      Email: ['', [Validators.required, Validators.email]],
      Password: ['', Validators.required],
    });
  }
}
