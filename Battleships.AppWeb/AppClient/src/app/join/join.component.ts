import { Component, OnInit } from "@angular/core";
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Router } from "@angular/router";

import { AuthService } from '../services/auth.service';
import { Subscription } from 'rxjs';
@Component({
  selector: "join",
  templateUrl: "./join.component.html",
  styleUrls: ['./join.component.css']
})
export class JoinComponent implements OnInit {
  title: string;
  form: FormGroup;
  constructor(private router: Router, private formBuilder: FormBuilder, private authService: AuthService) {
    //initialize the form
    this.createForm();
  }

  public ngOnInit() {
    if (this.authService.isLoggedIn()) {
      this.router.navigate(['']);
    }
  }

  public onSubmit() {
    let email = this.form.value.Email;
    let password = this.form.value.Password;
    this.authService.login(email, password)
      .subscribe(() => {
        this.router.navigate(['']);
      });
  }

  public onBack() {
    this.router.navigate(['']);
  }

  // returns TRUE if the FormControl is valid
  public isValid(name: string) {
    let e = this.getFormControl(name);
    return e && e.valid;
  }

  // returns TRUE if the FormControl has been changed
  public isChanged(name: string) {
    let e = this.getFormControl(name);
    return e && (e.dirty || e.touched);
  }

  // returns TRUE if the FormControl is invalid after user changes
  public hasError(name: string) {
    let e = this.getFormControl(name);
    return e && (e.dirty || e.touched) && !e.valid;
  }

  // retrieve a FormControl
  private getFormControl(name: string) {
    return this.form.get(name);
  }

  private createForm() {
    this.form = this.formBuilder.group({
      Email: ['',
        [Validators.required,
        Validators.email]
      ],
      Password: ['', Validators.required]
    });
  }
}
