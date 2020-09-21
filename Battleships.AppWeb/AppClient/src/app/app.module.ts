import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { NgxSpinnerModule } from "ngx-spinner";
import { RECAPTCHA_V3_SITE_KEY, RecaptchaV3Module } from 'ng-recaptcha';

import { ModalModule } from './modal-views';
import { SecurityService } from './services/security.service';
import { AuthService } from './services/auth.service';
import { ModalService } from './services/modal.service';
import { AuthGuard } from './helpers/auth.guard';

import { JtwInterceptor } from './helpers/jtw.interceptor';
import { ErrorInterceptor } from './helpers/error.interceptor';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { NavMenuComponent } from './nav-menu/nav-menu.component';
import { JoinComponent } from './user-join/user-join.component';
import { LoginExternalProvidersComponent } from './external-login-providers/external-login-providers.component';
import { RegisterComponent } from './user-register/user-register.component';
import { ForgottenComponent } from './forgotten-pass/forgotten-pass.component';
import { PassResetComponent } from './pass-reset/pass-reset.component';
import { TestComponent } from './user-test-auth/user-test-auth.component';
import { CloseComponent } from './close-external-login/close-external-login.component';
import { AdminComponent } from './admin-test-auth/admin-test-auth.component';

@NgModule({
  declarations: [
    AppComponent,
    NavMenuComponent,
    JoinComponent,
    LoginExternalProvidersComponent,
    RegisterComponent,
    ForgottenComponent,
    PassResetComponent,
    TestComponent,
    CloseComponent,
    AdminComponent
  ],
  imports: [
    RecaptchaV3Module,
    ModalModule,
    BrowserAnimationsModule,
    FormsModule,
    HttpClientModule,
    BrowserModule,
    AppRoutingModule,
    ReactiveFormsModule,
    NgxSpinnerModule
  ],
  providers: [
    { provide: RECAPTCHA_V3_SITE_KEY, useValue: '6Ldkfs0ZAAAAAGU1nSIrKUZ-C6mSy4TfpWETFypX' },
    AuthGuard,
    ModalService,
    SecurityService,
    AuthService,
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
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
