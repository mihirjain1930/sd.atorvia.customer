import { Route } from '@angular/router';
import { Meteor } from 'meteor/meteor';

import { SignupComponent } from "./auth/singup.component";
import { RecoverComponent } from "./auth/recover.component";
import { LoginComponent } from "./auth/login.component.web";
import { DashboardComponent } from "./dashboard/dashboard.component";
import { ResetPassword } from "./auth/resetpassword";
import { VerifyEmail } from "./auth/verifyemail.component";
import { accountRoutes } from "./account/account.routes";
import { routes as pageRoutes } from "./content-page/routes";
import { routes as faqRoutes } from "./faqs/routes";
import { routes as landingRoutes } from "./landing/routes";
import { routes as toursRoutes } from "./tours/routes";


let mainRoutes = [
    { path: 'dashboard', component: DashboardComponent, canActivate: ['canActivateForLoggedIn'] },
    { path: 'login', component: LoginComponent },
    { path: 'signup', component: SignupComponent },
    { path: 'recover', component: RecoverComponent },
    { path: 'reset-password/:token',component: ResetPassword },
    { path: 'verify-email/:token',component: VerifyEmail }
];

export const routes: Route[] = [
    ...mainRoutes,
    ...accountRoutes,
    ...pageRoutes,
    ...faqRoutes,
    ...landingRoutes,
    ...toursRoutes
];

export const ROUTES_PROVIDERS = [
    {
        provide: 'canActivateForLoggedIn',
        useValue: () => !! Meteor.userId()
    },
    {
        provide: 'canActivateForLogoff',
        useValue: () => ! Meteor.userId()
    },
];
