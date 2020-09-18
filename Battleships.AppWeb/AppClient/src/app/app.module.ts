import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations'; 
import { NgxSpinnerModule } from "ngx-spinner";
import { RECAPTCHA_V3_SITE_KEY, RecaptchaV3Module } from 'ng-recaptcha';

import { ModalModule } from './modal';
import { SecurityService } from './services/security.service';
import { AuthService } from './services/auth.service';
import { AuthGuard } from './helpers/auth.guard';

import { JtwInterceptor } from './helpers/jtw.interceptor';
import { ErrorInterceptor } from './helpers/error.interceptor';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { NavMenuComponent } from './nav-menu/nav-menu.component';
import { JoinComponent } from './join/join.component';
import { LoginExternalProvidersComponent } from './login.externalproviders/login.externalproviders.component';
import { RegisterComponent } from './register/register.component';
import { ForgottenComponent } from './forgotten/forgotten.component';
import { PassResetComponent } from './pass-reset/pass-reset.component';
import { TestComponent } from './test/test.component';
import { CloseComponent } from './close/close.component';
import { AdminComponent } from './admin/admin.component';

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
