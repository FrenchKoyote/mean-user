import { Component, OnInit, OnDestroy } from '@angular/core';
import { AuthService } from "./auth/auth.service";

import { Subscription } from 'rxjs/Subscription';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  
  profile: any;
  subscription: Subscription;
  
  constructor(public auth: AuthService) {
    auth.handleAuthentication();
    auth.scheduleRenewal();
    this.subscription = this.auth.getProfile().subscribe(currentProfile => { this.profile = currentProfile });
  }

  ngOnInit() : void {
    this.profile = this.auth.getProfile();
  }

  ngOnDestroy() {
    // unsubscribe to ensure no memory leaks
    this.subscription.unsubscribe();
  }

  title = 'app';
}
