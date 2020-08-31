import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { JoinComponent } from './join/join.component';
import { RegisterComponent } from './register/register.component';

const routes: Routes = [
  { path: 'join', component: JoinComponent },
  { path: 'register', component: RegisterComponent },
  { path: '', redirectTo: '/', pathMatch: 'full' },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
