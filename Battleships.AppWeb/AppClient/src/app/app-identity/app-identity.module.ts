import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { HttpClientModule } from '@angular/common/http';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { NgxSpinnerModule } from "ngx-spinner";
import { AppRoutingModule } from '../app-routing.module';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';

import { JoinComponent } from './user-join/user-join.component';
import { LoginExternalProvidersComponent } from './external-login-providers/external-login-providers.component';
import { RegisterComponent } from './user-register/user-register.component';
import { ForgottenComponent } from './forgotten-pass/forgotten-pass.component';
import { PassResetComponent } from './pass-reset/pass-reset.component';
import { CloseComponent } from './close-external-login/close-external-login.component';
import { RECAPTCHA_V3_SITE_KEY, RecaptchaV3Module } from 'ng-recaptcha';

@NgModule({
  imports: [
    FormsModule,
    ReactiveFormsModule,
    AppRoutingModule,
    NgxSpinnerModule,
    BrowserAnimationsModule,
    HttpClientModule,
    BrowserModule,
    RecaptchaV3Module
  ],
  declarations: [
    JoinComponent,
    LoginExternalProvidersComponent,
    RegisterComponent,
    ForgottenComponent,
    PassResetComponent,
    CloseComponent,
  ],
  exports: [
  ],
  providers: [
    { provide: RECAPTCHA_V3_SITE_KEY, useValue: '6Ldkfs0ZAAAAAGU1nSIrKUZ-C6mSy4TfpWETFypX' },
  ]
})
export class AppIdentityModule { }
