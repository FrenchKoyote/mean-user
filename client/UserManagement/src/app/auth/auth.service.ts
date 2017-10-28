import { Injectable } from '@angular/core';
import { AUTH_CONFIG } from './auth0-variables';
import { Router } from '@angular/router';
import { Observable } from "rxjs";
import 'rxjs/add/operator/filter';
import * as auth0 from 'auth0-js';

import { Subject } from 'rxjs/Subject';

@Injectable()
export class AuthService {

  userProfile: any;
  requestedScopes: string = 'openid profile read:timesheets create:timesheets';
  refreshSubscription: any;
  private subject = new Subject<any>();

  auth0 = new auth0.WebAuth({
    clientID: AUTH_CONFIG.clientID,
    domain: AUTH_CONFIG.domain,
    responseType: 'token id_token',
    audience: AUTH_CONFIG.apiUrl,
    redirectUri: AUTH_CONFIG.callbackURL,
    scope: 'openid profile read:users create:users'
  });

  constructor(public router: Router) {}

  public login(): void {
    this.auth0.authorize();
  }

  public getProfile(): Observable<any>  {
    
    const accessToken = localStorage.getItem('access_token');
    
    if (accessToken) {
      const self = this;
      this.auth0.client.userInfo(accessToken, (err, profile) => {
        if (profile) {
          self.userProfile = profile;
          this.subject.next({ auth: profile });
        }
        else
        {
          this.subject.next();
        }
      });
    }
    else{
      this.subject.next();
    }

    return this.subject.asObservable();
  }

  public handleAuthentication(): void {
    this.auth0.parseHash((err, authResult) => {
      if (authResult && authResult.accessToken && authResult.idToken) {
        window.location.hash = '';
        this.setSession(authResult);
        this.router.navigate(['/home']);
      } else if (err) {
        this.router.navigate(['/home']);
        console.log(err);
        alert(`Error: ${err.error}. Check the console for further details.`);
      }
    });
  }

  private setSession(authResult): void {
    // Set the time that the access token will expire at
    const expiresAt = JSON.stringify((authResult.expiresIn * 1000) + new Date().getTime());
    const scopes = authResult.scope || this.requestedScopes || '';

    localStorage.setItem('access_token', authResult.accessToken);
    localStorage.setItem('id_token', authResult.idToken);
    localStorage.setItem('expires_at', expiresAt);
    localStorage.setItem('scopes', JSON.stringify(scopes));

    const self = this;
    this.auth0.client.userInfo(authResult.accessToken, (err, profile) => {
      if (profile) {
        self.userProfile = profile;
        console.log(profile);
        this.subject.next({ auth: profile });
      }
    });

    this.scheduleRenewal();
  }

  public renewToken() {
    this.auth0.renewAuth({
      audience: AUTH_CONFIG.apiUrl,
      redirectUri: AUTH_CONFIG.silentCallbackURL,
      usePostMessage: true
    }, (err, result) => {
      if (!err) {
        this.setSession(result);
      }
    });
  }

  public scheduleRenewal() {
    if (!this.isAuthenticated()) return;
  
    const expiresAt = JSON.parse(window.localStorage.getItem('expires_at'));
  
    const source = Observable.of(expiresAt).flatMap(
      expiresAt => {
  
        const now = Date.now();
  
        // Use the delay in a timer to
        // run the refresh at the proper time
        var refreshAt = expiresAt - (1000 * 30); // Refresh 30 seconds before expiry
        return Observable.timer(Math.max(1, refreshAt - now));
      });
  
    // Once the delay time from above is
    // reached, get a new JWT and schedule
    // additional refreshes
    this.refreshSubscription = source.subscribe(() => {
      this.renewToken();
    });
  }
  
  public unscheduleRenewal() {
    if (!this.refreshSubscription) return;
    this.refreshSubscription.unsubscribe();
  }

  public logout(): void {
    // Remove tokens and expiry time from localStorage
    localStorage.removeItem('access_token');
    localStorage.removeItem('id_token');
    localStorage.removeItem('expires_at');
    localStorage.removeItem('scopes');
    this.unscheduleRenewal();

    this.subject.next();

    // Go back to the home route
    this.router.navigate(['/']);
  }

  public isAuthenticated(): boolean {
    // Check whether the current time is past the
    // access token's expiry time
    const expiresAt = JSON.parse(localStorage.getItem('expires_at'));
    return new Date().getTime() < expiresAt;
  }

  public userHasScopes(scopes: Array<string>): boolean {
    const grantedScopes = JSON.parse(localStorage.getItem('scopes')).split(' ');
    return scopes.every(scope => grantedScopes.includes(scope));
  }

}
