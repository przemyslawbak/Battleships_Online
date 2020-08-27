import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { JoinComponent } from './join/join.component';

const routes: Routes = [
  { path: 'join', component: JoinComponent },
      //{ path: 'register', component: RegisterComponent },
  //{ path: 'login-facebook', component: LoginFacebookComponent }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
