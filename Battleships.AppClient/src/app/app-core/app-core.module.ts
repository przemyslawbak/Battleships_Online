import { RandomizerService } from './_services/randomizer.service';
import { BoardFiltersService } from './_services/board-filters.service';
import { SpinnerInterceptor } from './_helpers/spinner.interceptor';
import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { HTTP_INTERCEPTORS, HttpClientModule } from '@angular/common/http';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { NgxSpinnerModule } from 'ngx-spinner';
import { AppRoutingModule } from '../app-routing.module';

import { ModalComponent } from './modal-views/modal-views.component';
import { NavMenuComponent } from './nav-menu/nav-menu.component';
import { PolicyComponent } from './policy/policy.component';
import { FooterComponent } from './footer/footer.component';

import { ErrorService } from './_services/error.service';
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
import { FleetService } from '@services/fleet.service';
import { TextService } from '@services/text.service';
import { HubConnectionService } from '@services/hub-connection.service';
import { HubBuilderService } from '@services/hub-builder.service';

import { AuthGuard } from './_helpers/auth.guard';
import { JwtInterceptor } from './_helpers/jwt.interceptor';
import { ErrorInterceptor } from './_helpers/error.interceptor';

@NgModule({
  imports: [
    AppRoutingModule,
    NgxSpinnerModule,
    BrowserAnimationsModule,
    HttpClientModule,
    BrowserModule,
  ],
  declarations: [
    ModalComponent,
    NavMenuComponent,
    PolicyComponent,
    FooterComponent,
  ],
  exports: [ModalComponent, NavMenuComponent, FooterComponent],
  providers: [
    {
      provide: HTTP_INTERCEPTORS,
      useClass: JwtInterceptor,
      multi: true,
    },
    {
      provide: HTTP_INTERCEPTORS,
      useClass: ErrorInterceptor,
      multi: true,
    },
    {
      provide: HTTP_INTERCEPTORS,
      useClass: SpinnerInterceptor,
      multi: true,
    },
    RandomizerService,
    BoardFiltersService,
    HubBuilderService,
    HubConnectionService,
    ErrorService,
    FleetService,
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
    TextService,
  ],
})
export class AppCoreModule {}
