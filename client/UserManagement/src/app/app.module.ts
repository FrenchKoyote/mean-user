import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule }   from '@angular/forms';
import { HttpModule, Http, RequestOptions } from '@angular/http';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { HomeComponent } from './home/home.component';
import { UserComponent } from './user/user.component';
import { UserService } from './service/user.service';
import { BsModalModule } from 'ng2-bs3-modal';
import { AuthService } from './auth/auth.service';
import { AuthGuard } from './guard/auth.guard';
import { LoginComponent } from './login/login.component';

import { AuthHttp, AuthConfig } from 'angular2-jwt';
import { CallbackComponent } from './callback/callback.component';

export function authHttpServiceFactory(http: Http, options: RequestOptions) {
  return new AuthHttp(new AuthConfig({
    tokenGetter: (() => localStorage.getItem('access_token'))
  }), http, options);
}


@NgModule({
  declarations: [
    AppComponent,
    HomeComponent,
    UserComponent,
    LoginComponent,
    CallbackComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    BsModalModule,
    FormsModule,
    ReactiveFormsModule,
    HttpModule
  ],
  providers: [UserService, AuthService, AuthGuard,
    //angular2-jwt config
    {
      provide: AuthHttp,
      useFactory: authHttpServiceFactory,
      deps: [Http, RequestOptions]
    }],
  bootstrap: [AppComponent]
})
export class AppModule { }
