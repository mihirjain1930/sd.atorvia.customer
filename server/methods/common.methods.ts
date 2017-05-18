import { Meteor } from "meteor/meteor";
import { Accounts } from 'meteor/accounts-base';
import { Roles } from 'meteor/alanning:roles';
import { check } from "meteor/check";
import { Email } from 'meteor/email';
import { HTTP } from "meteor/http";
import { Currencies } from "../../both/collections/currencies.collection";

declare var cheerio: any;

Meteor.methods({
  "sendEmail": (to: string, subject: string, html: string) => {
      let from = "atorvia12@gmail.com";
      return Email.send({ to, from, subject, html});
  },
  "sendEmailCustom": (to: string, subject: string, text: string) => {
      let Mailgun = require('mailgun').Mailgun;
      let email = new Mailgun('key-44af5040debdf3d034c42e9a5d2f82d8');
      let domain = "beta.atorvia.com";

      email.sendText("noreply@atorvia.com", to, subject, text, domain, (err) => {
        if (err) {
          console.log(err);
        }
      });
  }
});
