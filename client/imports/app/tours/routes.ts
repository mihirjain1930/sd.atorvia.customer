import { Route } from '@angular/router';
import { Meteor } from 'meteor/meteor';

import { SearchComponent } from "./search.component";

export const routes = [
    {path: "tours/search", component: SearchComponent},
    {path: "tours/search/:query", component: SearchComponent}
];
