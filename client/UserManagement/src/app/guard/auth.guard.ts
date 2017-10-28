import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, Router } from '@angular/router';
import { Observable } from 'rxjs/Observable';
import { AuthService } from "../auth/auth.service";

@Injectable()
export class AuthGuard implements CanActivate {
  
  constructor(private router: Router,public _authService:AuthService){
  }

  canActivate(): boolean {
     let isAuth = this._authService.isAuthenticated();
       if(isAuth)
         return true;
       else {
         this.router.navigate(['/login']);
         return false;
        }  
     }
}