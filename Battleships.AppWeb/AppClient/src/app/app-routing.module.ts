import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { JoinComponent } from './join/join.component';
import { RegisterComponent } from './register/register.component';
import { ForgottenComponent } from './forgotten/forgotten.component';
import { PassResetComponent } from './pass-reset/pass-reset.component';
import { TestComponent } from './test/test.component';
import { AuthGuard } from './services/auth.guard';

const routes: Routes = [
  { path: 'join', component: JoinComponent },
  { path: 'register', component: RegisterComponent },
  { path: 'forgotten', component: ForgottenComponent },
  { path: 'test', component: TestComponent, canActivate: [AuthGuard] },
  { path: 'pass-reset/:email/:token1/:token2/:token3/:token4/:token5', component: PassResetComponent },
  { path: '', redirectTo: '/', pathMatch: 'full' },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
