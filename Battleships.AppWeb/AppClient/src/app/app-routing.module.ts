import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { JoinComponent } from './user-join/user-join.component';
import { RegisterComponent } from './user-register/user-register.component';
import { ForgottenComponent } from './forgotten-pass/forgotten-pass.component';
import { PassResetComponent } from './pass-reset/pass-reset.component';
import { TestComponent } from './user-test-auth/user-test-auth.component';
import { CloseComponent } from './close-external-login/close-external-login.component';
import { AdminComponent } from './admin-test-auth/admin-test-auth.component';
import { AuthGuard } from './helpers/auth.guard';
import { UserRole } from './models/user-role.model';

const routes: Routes = [
  {
    path: 'join',
    component: JoinComponent
  },
  {
    path: 'register',
    component: RegisterComponent
  },
  {
    path: 'forgotten',
    component: ForgottenComponent
  },
  {
    path: 'close/:email/:user/:token/:refresh',
    component: CloseComponent
  },
  {
    path: 'test',
    component: TestComponent,
    canActivate: [AuthGuard]
  },
  {
    path: 'admin',
    component: AdminComponent,
    canActivate: [AuthGuard],
    data: { roles: [UserRole.Admin] }
  },
  {
    path: 'pass-reset/:email/:token',
    component: PassResetComponent
  },
  {
    path: '', redirectTo: '/',
    pathMatch: 'full'
  },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
