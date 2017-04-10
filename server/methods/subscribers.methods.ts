import { Meteor } from "meteor/meteor";
import { Accounts } from 'meteor/accounts-base';
import { Roles } from 'meteor/alanning:roles';
import { check } from "meteor/check";
import { Subscribers } from "../../both/collections/subscribers.collection";
import { Subscriber } from "../../both/models/subscriber.model";


Meteor.methods({
  "subscribers.insert": (email, group) : void => {
    let dataToInsert = {
      email: email,
      group: group,
      createdAt: new Date
    };

    Subscribers.collection.insert(dataToInsert);
  }
});
