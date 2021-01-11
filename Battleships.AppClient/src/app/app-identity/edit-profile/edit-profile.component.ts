import { EditUser } from '@models/edit-user.model';
import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '@services/auth.service';
import { environment } from '@environments/environment';
import { HttpClient } from '@angular/common/http';
import { NgxSpinnerService } from 'ngx-spinner';
import { ModalService } from '@services/modal.service';

@Component({
  selector: 'edit-profile',
  templateUrl: './edit-profile.component.html',
  styleUrls: ['./edit-profile.component.css'],
})
export class EditProfileComponent {
  public form: FormGroup;
  constructor(
    private modalService: ModalService,
    private router: Router,
    private formBuilder: FormBuilder,
    private auth: AuthService,
    private http: HttpClient,
    private spinner: NgxSpinnerService
  ) {
    // initialize the form
    this.createForm();
  }

  public hasError(name: string) {
    const e = this.getFormControl(name);
    return e && (e.dirty || e.touched) && !e.valid;
  }

  public onBack() {
    this.router.navigate(['']);
  }

  public getFormControl(name: string) {
    return this.form.get(name);
  }

  private createForm() {
    let user = this.auth.getAuth();
    this.form = this.formBuilder.group({
      Email: [user.email, [Validators.required, Validators.email]],
      DisplayName: [user.displayName, Validators.required],
    });
  }

  public onSubmit() {
    this.spinner.show();
    const model = {} as EditUser;
    model.userName = this.auth.getAuth().user;
    model.displayName = this.form.value.DisplayName;
    model.email = this.form.value.Email;
    const url = environment.apiUrl + 'api/user/edit';
    this.http.post(url, model).subscribe(() => {
      this.spinner.hide();
      this.auth.logout();
      this.modalService.open(
        'info-modal',
        'Now you can login with new credentials.'
      );
    });
  }

  public onResetPass(): void {
    this.router.navigate(['reset-pass']);
  }
}