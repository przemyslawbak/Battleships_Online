import { Component, OnInit } from "@angular/core";
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Router } from "@angular/router";

import { AuthService } from '../services/auth.service';
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
    var email = this.form.value.Email;
    var password = this.form.value.Password;
    this.authService.login(email, password)
      .subscribe(() => {
      },
        err => {
          // login failed
          console.log(err)
          this.form.setErrors({
            "auth": "Incorrect username or password"
          });
        });
  }

  public onBack() {
    this.router.navigate(['']);
  }

  // returns TRUE if the FormControl is valid
  public isValid(name: string) {
    var e = this.getFormControl(name);
    return e && e.valid;
  }

  // returns TRUE if the FormControl has been changed
  public isChanged(name: string) {
    var e = this.getFormControl(name);
    return e && (e.dirty || e.touched);
  }

  // returns TRUE if the FormControl is invalid after user changes
  public hasError(name: string) {
    var e = this.getFormControl(name);
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
