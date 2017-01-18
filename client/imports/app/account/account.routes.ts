import { Routes } from '@angular/router';

import { UserDetailsComponent }    from './account.component';
import {PasswordComponent}  from './changepassword.component';


// Route Configuration
export const accountRoutes: Routes = [
  { path: 'account/:id', component: UserDetailsComponent },
  { path: 'changepassword',component: PasswordComponent },                                       

];
