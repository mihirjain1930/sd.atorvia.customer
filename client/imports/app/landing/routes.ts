import { Route } from '@angular/router';
import { Meteor } from 'meteor/meteor';

import { LandingComponent } from "./landing.component";
import { ContactFormComponent } from "./contact-form.component";
export const routes = [
    {path: "", component: LandingComponent},
    {path: "contact-us", component: ContactFormComponent}
];
