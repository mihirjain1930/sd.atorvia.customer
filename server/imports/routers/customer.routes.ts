import * as bodyParser from "body-parser";

declare var Picker: any;

// Define our middleware using the Picker.middleware() method.
Picker.middleware( bodyParser.json() );
Picker.middleware( bodyParser.urlencoded( { extended: false } ) );

// Define our routes.
Picker.route( '/bookings/voucher/:id', function( params, request, response, next ) {
  let fs = require("fs-extra");

  let filePath = `${process.env.PWD}/../supplier/uploads/pdfs/voucher-${params.id}.pdf`;

  fs.readFile(`${filePath}`, (err, data) => {
    if (err) {
      response.end( "Error while downloading file. Please recheck the file name." ); 
      console.log(err);
    }
    else {
      response.setHeader('Content-Type', 'application/force-download');
      response.setHeader("Content-Disposition","attachment; filename=\"voucher-" + params.id + ".pdf\"");
      response.end( data );
    }
  });
});
