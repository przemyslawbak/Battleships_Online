import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';

import { AuthService } from './services/auth.service';

import { AuthInterceptor } from './interceptors/auth.interceptor';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { NavMenuComponent } from './nav-menu/nav-menu.component';
import { JoinComponent } from './join/join.component';
import { LoginExternalProvidersComponent } from './login.externalproviders/login.externalproviders.component';
import { RegisterComponent } from './register/register.component';
import { ForgottenComponent } from './forgotten/forgotten.component';
import { PassResetComponent } from './pass-reset/pass-reset.component';
import { TestComponent } from './test/test.component';
//import { NgbModule } from '@ng-bootstrap/ng-bootstrap';

@NgModule({
  declarations: [
    AppComponent,
    NavMenuComponent,
    JoinComponent,
    LoginExternalProvidersComponent,
    RegisterComponent,
    ForgottenComponent,
    PassResetComponent,
    TestComponent
  ],
  imports: [
    FormsModule,
    HttpClientModule,
    BrowserModule,
    AppRoutingModule,
    ReactiveFormsModule,
    //NgbModule.forRoot()
  ],
  providers: [AuthService,
    {
      provide: HTTP_INTERCEPTORS,
      useClass: AuthInterceptor,
      multi: true
    }],
  bootstrap: [AppComponent]
})
export class AppModule { }
