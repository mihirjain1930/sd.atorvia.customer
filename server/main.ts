import { Meteor } from 'meteor/meteor';
import { Accounts } from 'meteor/accounts-base';
import './startup/accounts-config';
import './startup/service-config';
import './imports/publications/users';
import './imports/publications/currencies';
import './imports/routers/email.routes';
import './imports/routers/tour.routes';
import './imports/routers/paypal.routes';
import './imports/routers/customer.routes';
import './startup/email-config';

Meteor.startup(() => {
  // update exchange rates every hour
  Meteor.setInterval(() => {
    Meteor.call("syncExchangeRates");
  }, 60 * 60 * 1000);
});
