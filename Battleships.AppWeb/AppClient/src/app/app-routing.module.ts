import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { JoinComponent } from './join/join.component';
import { RegisterComponent } from './register/register.component';
import { ForgottenComponent } from './forgotten/forgotten.component';
import { PassResetComponent } from './pass-reset/pass-reset.component';

const routes: Routes = [
  { path: 'join', component: JoinComponent },
  { path: 'register', component: RegisterComponent },
  { path: 'forgotten', component: ForgottenComponent },
  { path: 'reset/:email/:token1/:token2/:token3', component: PassResetComponent },
  { path: '', redirectTo: '/', pathMatch: 'full' },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
