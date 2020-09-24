import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { JoinComponent } from './app-identity/user-join/user-join.component';
import { RegisterComponent } from './app-identity/user-register/user-register.component';
import { ForgottenComponent } from './app-identity/forgotten-pass/forgotten-pass.component';
import { PassResetComponent } from './app-identity/pass-reset/pass-reset.component';
import { CloseComponent } from './app-identity/close-external-login/close-external-login.component';

import { AuthGuard } from './app-core/_helpers/auth.guard';
import { UserRole } from '@models/user-role.model';

import { TestComponent } from './app-trials/user-test-auth/user-test-auth.component';
import { AdminComponent } from './app-trials/admin-test-auth/admin-test-auth.component';

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
