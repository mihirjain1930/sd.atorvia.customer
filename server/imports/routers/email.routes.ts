import * as bodyParser from "body-parser";

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
  let mailgun = new Mailgun('key-755f427d33296fe30862b0278c460e84');
  let domain = "sandbox3f697e79ae2849f5935a5a60e59f9795.mailgun.org";
  let recipientUser = Meteor.users.findOne({"_id": userId});
  let senderUser = Meteor.users.findOne({"emails.address": sender});
  let senderEmail = `user-${recipientUser._id}@${domain}`;

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
