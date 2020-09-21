import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { HttpClientModule } from '@angular/common/http';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { NgxSpinnerModule } from "ngx-spinner";

import { TestComponent } from './user-test-auth/user-test-auth.component';
import { AdminComponent } from './admin-test-auth/admin-test-auth.component';

@NgModule({
  imports: [
    NgxSpinnerModule,
    BrowserAnimationsModule,
    HttpClientModule,
    BrowserModule
  ],
  declarations: [
    TestComponent,
    AdminComponent
  ],
  exports: [
  ],
  providers: [
  ]
})
export class AppTrialsModule { }
