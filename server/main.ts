import { Meteor } from 'meteor/meteor';
import { Accounts } from 'meteor/accounts-base';
import './startup/accounts-config';
import './startup/service-config';
import './imports/publications/users';
import './imports/routers/email.routes';
import './imports/routers/tour.routes';
import './imports/routers/paypal.routes';
import './startup/email-config';

Meteor.startup(() => {

});
