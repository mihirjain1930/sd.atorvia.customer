declare var Picker: any;

let bodyParser = require("body-parser");
// Define our middleware using the Picker.middleware() method.
Picker.middleware( bodyParser.json() );
Picker.middleware( bodyParser.urlencoded( { extended: false } ) );

// Define our routes.
Picker.route( '/emails', function( params, request, response, next ) {
  // Handle our request and response here.

  var data = {
    params: params,
    query: params.query,
    body: request.body
  };
  console.log(data);

  response.setHeader( 'Content-Type', 'application/json' );
  response.statusCode = 200;
  response.end( "true" );
});
