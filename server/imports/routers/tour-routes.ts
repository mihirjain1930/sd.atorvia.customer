import { Meteor } from "meteor/meteor";
declare var Picker: any;
interface Pagination {
  limit: number;
  skip: number;
};
interface Options extends Pagination {
  [key: string]: any
};

let bodyParser = require("body-parser");
// Define our middleware using the Picker.middleware() method.
Picker.middleware( bodyParser.json() );
Picker.middleware( bodyParser.urlencoded( { extended: false } ) );

// Define our routes.
Picker.route( '/api/1.0/tours/search', function( params, request, response, next ) {
  // Handle our request and response here.

  let data = {
    query: params.query,
    body: request.body
  };
  console.log(data);

  const options: Options = {
      limit: 10,
      skip: 0,
      sort: { "totalAvailableSeats": -1 },
      fields: {"name": 1}
  };
  let item = this.item;
  let where = {active: true, approved: true};
  let tours = Meteor.call("tours.find", options, where, params.query.searchString);

  response.setHeader( 'Content-Type', 'application/json' );
  response.statusCode = 200;
  response.end( JSON.stringify(tours.data) );
});
