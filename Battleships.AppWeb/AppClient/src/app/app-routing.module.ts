import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { JoinComponent } from './join/join.component';
import { RegisterComponent } from './register/register.component';
import { ForgottenComponent } from './forgotten/forgotten.component';
import { PassResetComponent } from './pass-reset/pass-reset.component';
import { TestComponent } from './test/test.component';
import { CloseComponent } from './close/close.component';
import { AdminComponent } from './admin/admin.component';
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
