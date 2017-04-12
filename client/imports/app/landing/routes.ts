import { Route } from '@angular/router';
import { Meteor } from 'meteor/meteor';

import { LandingComponent } from "./landing.component";
import { TopDestinationsComponent } from "./top-destinations.component";

export const routes = [
    {path: "", component: LandingComponent},
    {path: "top-destinations", component: TopDestinationsComponent}
];
