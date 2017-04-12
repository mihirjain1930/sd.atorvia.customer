import { Meteor } from "meteor/meteor";
import { Accounts } from 'meteor/accounts-base';
import { Roles } from 'meteor/alanning:roles';
import {check} from "meteor/check";

Meteor.methods({
  "sendEmail": (to: string, from: string,subject: string, text: string) => {
      return Email.send({ to, from, subject, text});
  }
});
