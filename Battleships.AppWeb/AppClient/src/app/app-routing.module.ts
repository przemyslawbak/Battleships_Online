import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

//auth
import { JoinComponent } from './app-identity/user-join/user-join.component';
import { RegisterComponent } from './app-identity/user-register/user-register.component';
import { ForgottenComponent } from './app-identity/forgotten-pass/forgotten-pass.component';
import { PassResetComponent } from './app-identity/pass-reset/pass-reset.component';
import { CloseComponent } from './app-identity/close-external-login/close-external-login.component';

//misc
import { AuthGuard } from './app-core/_helpers/auth.guard';
import { UserRole } from '@models/user-role.model';

//trial
import { TestComponent } from './app-trials/user-test-auth/user-test-auth.component';
import { AdminComponent } from './app-trials/admin-test-auth/admin-test-auth.component';

//game
import { GameMainComponent } from './app-game/game-main/game-main.component';
import { GameBestComponent } from './app-game/game-best/game-best.component';
import { GameEnterComponent } from './app-game/game-enter/game-enter.component';
import { GameShareComponent } from './app-game/game-share/game-share.component';
import { GameStartComponent } from './app-game/game-start/game-start.component';

const routes: Routes = [
  {
    path: 'best',
    component: GameBestComponent,
  },
  {
    path: 'enter',
    component: GameEnterComponent,
  },
  {
    path: 'share',
    component: GameShareComponent,
  },
  {
    path: 'start',
    component: GameStartComponent,
  },
  {
    path: 'join',
    component: JoinComponent,
  },
  {
    path: 'register',
    component: RegisterComponent,
  },
  {
    path: 'forgotten',
    component: ForgottenComponent,
  },
  {
    path: 'close/:email/:user/:token/:refresh',
    component: CloseComponent,
  },
  {
    path: 'test',
    component: TestComponent,
    canActivate: [AuthGuard],
  },
  {
    path: 'admin',
    component: AdminComponent,
    canActivate: [AuthGuard],
    data: { roles: [UserRole.Admin] },
  },
  {
    path: 'pass-reset/:email/:token',
    component: PassResetComponent,
  },
  {
    path: '',
    component: GameMainComponent,
  },
  {
    path: 'game',
    component: GameMainComponent,
  },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
