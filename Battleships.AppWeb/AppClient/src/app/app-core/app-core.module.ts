import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { HTTP_INTERCEPTORS, HttpClientModule } from '@angular/common/http';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { NgxSpinnerModule } from 'ngx-spinner';
import { AppRoutingModule } from '../app-routing.module';

import { ModalComponent } from './modal-views/modal-views.component';
import { NavMenuComponent } from './nav-menu/nav-menu.component';

import { HttpService } from '@services/http.service';
import { ModalService } from '@services/modal.service';
import { SecurityService } from '@services/security.service';
import { AuthService } from '@services/auth.service';
import { PlayerService } from '@services/player.service';
import { GameService } from '@services/game.service';
import { SignalRService } from '@services/signal-r.service';
import { BoardService } from '@services/board.service';
import { CommentsService } from '@services/comments.service';
import { AiService } from '@services/ai.service';

import { AuthGuard } from './_helpers/auth.guard';
import { JtwInterceptor } from './_helpers/jtw.interceptor';
import { ErrorInterceptor } from './_helpers/error.interceptor';

@NgModule({
  imports: [
    AppRoutingModule,
    NgxSpinnerModule,
    BrowserAnimationsModule,
    HttpClientModule,
    BrowserModule,
  ],
  declarations: [ModalComponent, NavMenuComponent],
  exports: [ModalComponent, NavMenuComponent],
  providers: [
    {
      provide: HTTP_INTERCEPTORS,
      useClass: JtwInterceptor,
      multi: true,
    },
    {
      provide: HTTP_INTERCEPTORS,
      useClass: ErrorInterceptor,
      multi: true,
    },
    AiService,
    CommentsService,
    BoardService,
    PlayerService,
    ModalService,
    SecurityService,
    AuthService,
    HttpService,
    AuthGuard,
    GameService,
    SignalRService,
  ],
})
export class AppCoreModule {}
