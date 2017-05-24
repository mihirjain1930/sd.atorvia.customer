import { Meteor } from "meteor/meteor";
import * as bodyParser from "body-parser";
import * as _ from 'underscore';

declare var Picker: any;

// Define our middleware using the Picker.middleware() method.
Picker.middleware( bodyParser.json() );
Picker.middleware( bodyParser.urlencoded( { extended: false } ) );

// Define our routes.
Picker.route( '/emails', function( params, request, response, next ) {
  // Handle our request and response here.

  /*var data = {
    params: params,
    query: params.query,
    body: request.body
  };
  console.log(data);*/

  let body = request.body;
  let recipient = body.recipient
  let sender = body.sender;
  let subject = body.subject;
  let message = body['body-html'];

  let text2 = recipient.split("-");
  let text3 = text2[1].split("@");
  let userId = text3[0];

  console.log("recipient:", recipient);
  console.log("senderEmail:", sender);
  console.log("subject:", subject);
  console.log("contents:", message);

  let Mailgun = require('mailgun').Mailgun;
  let mailgunKey = Meteor.settings.public["mailgun"] ["key"];
  let mailgunDomain = Meteor.settings.public["mailgun"] ["domain"];
  let mailgun = new Mailgun(mailgunKey);
  let domain = mailgunDomain;
  let recipientUser = Meteor.users.findOne({"_id": userId});
  let senderUser = Meteor.users.findOne({"emails.address": sender});
  if (_.isEmpty(recipientUser) || _.isEmpty(senderUser)) {
    response.setHeader( 'Content-Type', 'application/json' );
    response.statusCode = 200;
    response.end( "false" );
  }
  let senderEmail = `user-${senderUser._id}@${domain}`;

  mailgun.sendText(senderEmail, recipientUser.emails[0].address, subject, message, domain, (err) => {
    if (! err) {
      console.log("done");
      return true;
    } else {
      console.log(err);
      return false;
    }
  })

  response.setHeader( 'Content-Type', 'application/json' );
  response.statusCode = 200;
  response.end( "true" );
});
