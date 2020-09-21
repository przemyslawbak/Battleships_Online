import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { HTTP_INTERCEPTORS, HttpClientModule } from '@angular/common/http';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { NgxSpinnerModule } from "ngx-spinner";
import { AppRoutingModule } from '../app-routing.module';

import { ModalComponent } from './modal-views/modal-views.component';
import { NavMenuComponent } from './nav-menu/nav-menu.component';

import { ModalService } from './_services/modal.service';
import { SecurityService } from './_services/security.service';
import { AuthService } from './_services/auth.service';

import { AuthGuard } from './_helpers/auth.guard';
import { JtwInterceptor } from './_helpers/jtw.interceptor';
import { ErrorInterceptor } from './_helpers/error.interceptor';

@NgModule({
  imports: [
    AppRoutingModule,
    NgxSpinnerModule,
    BrowserAnimationsModule,
    HttpClientModule,
    BrowserModule
  ],
  declarations: [
    ModalComponent,
    NavMenuComponent
  ],
  exports: [
    ModalComponent,
    NavMenuComponent
  ],
  providers: [
    {
      provide: HTTP_INTERCEPTORS,
      useClass: JtwInterceptor,
      multi: true
    },
    {
      provide: HTTP_INTERCEPTORS,
      useClass: ErrorInterceptor,
      multi: true
    },
    ModalService,
    SecurityService,
    AuthService,
    AuthGuard
  ]
})
export class AppCoreModule { }
