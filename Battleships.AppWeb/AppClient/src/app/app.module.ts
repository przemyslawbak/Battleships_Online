import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { NavMenuComponent } from './nav-menu/nav-menu.component';
import { AuthService } from './services/auth.service';
import { AuthInterceptor } from './services/auth.interceptor';
//import { LoginComponent } from './login/login.component';
//import { RegisterComponent } from './register/register.component';
//import { NgbModule } from '@ng-bootstrap/ng-bootstrap';

@NgModule({
  declarations: [
    AppComponent,
    NavMenuComponent,
    //LoginComponent,
    //RegisterComponent
  ],
  imports: [
    HttpClientModule,
    RouterModule.forRoot([
      //{ path: 'login', component: LoginComponent },
      //{ path: 'register', component: RegisterComponent },
      //{ path: 'login-facebook', component: LoginFacebookComponent }
    ]),
    BrowserModule,
    AppRoutingModule,
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
