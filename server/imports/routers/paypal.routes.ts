import { Meteor } from "meteor/meteor";
import { HTTP } from 'meteor/http'
import * as bodyParser from "body-parser";
import * as paypal from "paypal-rest-sdk";
import { Transactions } from "../../../both/collections/transactions.collection";
import { Bookings } from "../../../both/collections/bookings.collection";

// configue paypal sdk
paypal.configure({
  'mode': 'sandbox', //sandbox or live
  'client_id': 'AeNIxZgtK5ybDTEbj8kOwsC-apBuG6fs_eRgtyIq4qS5SzDOtTsBla2FIl3StvVhJHltFFf-RBSAyp7c',
  'client_secret': 'EJkxMwNb1sfofwhXEgDf-epl-3qDmrwDIdRGoL0SD6iMJsFk4jn5r3ZDpAnvg7LRE5Xjcre-zlRvTHiA'
});

declare var Picker: any;
let rootUrl = process.env.ROOT_URL;

// Define our middleware using the Picker.middleware() method.
Picker.middleware( bodyParser.json() );
Picker.middleware( bodyParser.urlencoded( { extended: false } ) );

Picker.route( '/api/1.0/paypal/token/create', function( params, request, response, next ) {
  let result = HTTP.call("POST", "https://api.sandbox.paypal.com/v1/oauth2/token", {
    "auth": "AeNIxZgtK5ybDTEbj8kOwsC-apBuG6fs_eRgtyIq4qS5SzDOtTsBla2FIl3StvVhJHltFFf-RBSAyp7c:EJkxMwNb1sfofwhXEgDf-epl-3qDmrwDIdRGoL0SD6iMJsFk4jn5r3ZDpAnvg7LRE5Xjcre-zlRvTHiA",
    "headers": ["Accept: application/json", "Accept-Language: en_US"],
    "content": "grant_type=client_credentials"
  });

  response.end( JSON.stringify(result.data) );
});

Picker.route( '/api/1.0/paypal/payment/create', function( params, request, response, next ) {
  let body = request.body;
  let booking = body.booking;
  if (typeof booking == "undefined" || typeof booking.tour == "undefined") {
    console.log("Invalid booking data supplied.");
    response.end( JSON.stringify({status: false}) );
    return;
  }

  let create_payment_json = {
    "intent": "sale",
    "payer": {
        "payment_method": "paypal"
    },
    "redirect_urls": {
        "return_url": `${rootUrl}/api/1.0/paypal/payment/execute`,
        "cancel_url": `${rootUrl}/tours/search`
    },
    "transactions": [{
        "item_list": {
            "items": [{
                "name": booking.tour.name,
                "sku": booking.tour.id,
                "price": booking.totalPrice,
                "currency": "AUD",
                "quantity": 1
            }]
        },
        "amount": {
          "total": booking.totalPrice,
          "currency": "AUD"
        },
        "description": "This is the payment description."
    }]
  };

  paypal.payment.create(create_payment_json, Meteor.bindEnvironment( (error, payment) => {
      if (error) {
          console.log(error.response);
          response.end( JSON.stringify(error) );
      } else {
          console.log("Get Payment Create");

          // insert transaction in mongodb
          payment.bookingId = booking._id;
          payment.userId = booking.user.id;
          payment.createdAt = new Date();
          var transactionId = Transactions.collection.insert(payment);
          console.log("new transactionId:", transactionId);
          // update booking collection
          Bookings.collection.update({_id: booking._id}, {$set: {
            paymentInfo: {
              gateway: "paypal",
              method: "express_checkout",
              transactionId,
              gatewayTransId: payment.id,
              "status": payment.state
            }
          } });

          response.end( JSON.stringify(payment) );
      }
  }) );
});

Picker.route( '/api/1.0/paypal/payment/execute/', function( params, request, response, next ) {
  let body = request.body;
  let args = params.query;
  let transaction = <any>Transactions.findOne({"id": args.paymentId});
  console.log(transaction);

  let execute_payment_json = {
      "payer_id": args.PayerID,
      "transactions": transaction.transactions
  };

  paypal.payment.execute(args.paymentId, execute_payment_json, Meteor.bindEnvironment( (error, payment) => {
      let html = null;
      html = `<html>
          <head>
              <title>Payment Failed</title>
              <meta http-equiv="refresh" content="5;url=${rootUrl}" >
          </head>
          <body>
            <p>Payment processing was failed. Please contact customer support for further details.</p>
            <p>Please wait, you are being redirected to main application.</p>
            <p><a href="/">Click here</a>, If you are not redirected automatically.</p>
          </body>
      </html>`;

      if (error) {
          console.log(error.response);

      } else {
          console.log("Get Payment Response");

          // mongodb update transaction
          if (payment.state == "approved") {
            // update transaction object
            let res = Transactions.collection.update({_id: transaction._id}, {$set: payment});
            console.log("transaction update: ", res);
            // update booking object
            // update booking collection
            Bookings.collection.update({_id: transaction.bookingId}, {$set: {
              "paymentInfo.status": payment.state,
              paymentDate: new Date()
            } });

            html = `<html>
                <head>
                    <title>Payment Successful</title>
                    <meta http-equiv="refresh" content="5;url=${rootUrl}" >
                </head>
                <body>
                  <p>Your payment was successful. Please wait, you are being redirected to main application.</p>
                  <p><a href="/">Click here</a>, If you are not redirected automatically.</p>
                </body>
            </html>`;
          }
          //console.log(JSON.stringify(payment));
          //response.end( JSON.stringify(payment) );
      }

      response.end( html );
  }) );
});

Picker.route( '/api/1.0/paypal/payment/get/', function( params, request, response, next ) {
  let body = request.body;
  let args = params.query;

  paypal.payment.get(args.paymentId, function (error, payment) {
      if (error) {
          console.log(error);
          response.end( JSON.stringify(error) );
      } else {
          console.log("Get Payment Response");
          response.end( JSON.stringify(payment) );
      }
  });
});

Picker.route('/api/1.0/paypal/card-payment/create', function( params, request, response, next ) {
  let body = request.body;
  let cardDetails = body.cardDetails;
  let booking = body.booking;
  let totalPrice = booking.totalPrice;
  let address = booking.travellers[0];

  var create_payment_json = {
        "intent": "sale",
        "payer": {
            "payment_method": "credit_card",
            "funding_instruments": [{
                "credit_card": {
                    "type": cardDetails.cardType,
                    "number": cardDetails.cardNumber,
                    "expire_month": cardDetails.expiryMonth,
                    "expire_year": cardDetails.expiryYear,
                    "cvv2": cardDetails.cvvNumber,
                    "first_name": cardDetails.firstName,
                    "last_name": cardDetails.lastName,
                    "billing_address": {
                        "line1": address.addressLine1,
                        "city": address.suburb,
                        "state": address.state,
                        "postal_code": address.postCode,
                        "country_code": address.country
                    }
                }
            }]
        },
        "transactions": [{
            "amount": {
                "total": totalPrice,
                "currency": "AUD"
            },
            "description": "This is the payment transaction description."
        }]
    };

  paypal.payment.create(create_payment_json, Meteor.bindEnvironment( (error, payment) => {
      // insert transaction in mongodb
      payment.bookingId = booking._id;
      payment.userId = booking.user.id;
      payment.createdAt = new Date();
      var transactionId = Transactions.collection.insert(payment);
      console.log("new transactionId:", transactionId);

      if (error) {
          response.end( JSON.stringify({success: false}) );
      } else {
          Bookings.collection.update({_id: booking._id}, {$set: {
            paymentInfo: {
              gateway: "paypal",
              method: "credit_card",
              transactionId,
              gatewayTransId: payment.id,
              "status": payment.state
            }
          } });
          response.end( JSON.stringify({success: true}) );
      }
  }) );
})
