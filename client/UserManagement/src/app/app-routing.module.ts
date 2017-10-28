import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { HomeComponent } from "./home/home.component";
import { UserComponent } from "./user/user.component";
import { AuthGuard } from "./guard/auth.guard";
import { LoginComponent } from "./login/login.component";
import { CallbackComponent } from "./callback/callback.component";


const routes: Routes = [
  { path: '', 
  redirectTo: 'home',
   pathMatch: 'full' },
  {
    path: 'home',
    component: HomeComponent
  },
  {
    path: 'user',
    component: UserComponent,
    canActivate: [AuthGuard]
  },
  {
    path: 'login',
    component: LoginComponent
  },
  {
    path: 'callback',
    component: CallbackComponent
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }