import { Meteor } from "meteor/meteor";
import { Accounts } from 'meteor/accounts-base';
import { Roles } from 'meteor/alanning:roles';
import { check } from "meteor/check";
import { Email } from 'meteor/email'

Meteor.methods({
  "sendEmail": (to: string, subject: string, text: string) => {
      let from = "atorvia12@gmail.com";
      return Email.send({ to, from, subject, text});
  }
});
