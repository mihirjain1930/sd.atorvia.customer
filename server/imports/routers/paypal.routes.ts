import { HTTP } from 'meteor/http'
import * as bodyParser from "body-parser";
import * as paypal from "paypal-rest-sdk";

// configue paypal sdk
paypal.configure({
  'mode': 'sandbox', //sandbox or live
  'client_id': 'AX2Jh5m5jc36KnhUx0hCoSydzFNTgEIJ7_cgnFxEupR_zx7T9tmmELHzBka6ed8v3UgO6nJT0jq2bYux',
  'client_secret': 'EPsV-bZDxjqoARgCv4JY4Cyw_L0ADV5DPBmTmztjYFFkKTiNi4X1xmygMWtACq9aan3GACwrs1GmjXl2'
});

declare var Picker: any;

// Define our middleware using the Picker.middleware() method.
Picker.middleware( bodyParser.json() );
Picker.middleware( bodyParser.urlencoded( { extended: false } ) );

Picker.route( '/api/1.0/paypal/token/create', function( params, request, response, next ) {
  let result = HTTP.call("POST", "https://api.sandbox.paypal.com/v1/oauth2/token", {
    "auth": "AX2Jh5m5jc36KnhUx0hCoSydzFNTgEIJ7_cgnFxEupR_zx7T9tmmELHzBka6ed8v3UgO6nJT0jq2bYux:EPsV-bZDxjqoARgCv4JY4Cyw_L0ADV5DPBmTmztjYFFkKTiNi4X1xmygMWtACq9aan3GACwrs1GmjXl2",
    "headers": ["Accept: application/json", "Accept-Language: en_US"],
    "content": "grant_type=client_credentials"
  });

  response.end( JSON.stringify(result.data) );
});

Picker.route( '/api/1.0/paypal/payment/create', function( params, request, response, next ) {
  let create_payment_json = {
    "intent": "sale",
    "payer": {
        "payment_method": "paypal"
    },
    "redirect_urls": {
        "return_url": "http://localhost:8082/booking/step2",
        "cancel_url": "http://localhost:8082/tours/search"
    },
    "transactions": [{
        "item_list": {
            "items": [{
                "name": "item",
                "sku": "item",
                "price": "1.45",
                "currency": "AUD",
                "quantity": 1
            }]
        },
        "amount": {
          "total": "1.45",
          "currency": "AUD"
        },
        "description": "This is the payment description."
    }]
  };

  paypal.payment.create(create_payment_json, function (error, payment) {
      if (error) {
          console.log(error.response);
          throw error;
      } else {
          console.log(payment);

          response.end( JSON.stringify({payToken: payment.id}) );
      }
  });
});

Picker.route( '/api/1.0/paypal/payment/execute/', function( params, request, response, next ) {
  let body = request.body;

  let execute_payment_json = {
      "payer_id": body.payerId,
      "transactions": [{
          "amount": {
            "total": 1.45,
            "currency": "AUD"
          }
      }]
  };

  paypal.payment.execute(body.payToken, execute_payment_json, function (error, payment) {
      if (error) {
          console.log(error.response);
          throw error;
      } else {
          console.log("Get Payment Response");
          console.log(JSON.stringify(payment));

          response.end( JSON.stringify({success: true}) );
      }
  });
});
