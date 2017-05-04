import { Meteor } from "meteor/meteor";
import { Tours } from "../../both/collections/tours.collection";
import { Tour } from "../../both/models/tour.model";
import { Bookings } from "../../both/collections/bookings.collection";
import { Booking } from "../../both/models/booking.model";
import { Transactions } from "../../both/collections/transactions.collection";
import { isLoggedIn, userIsInRole } from "../imports/services/auth";
import * as _ from 'underscore';

interface Options {
  [key: string]: any;
}

Meteor.methods({
    "bookings.insert": (booking: Booking) => {
        userIsInRole(["customer"]);

        let user = Meteor.user();
        booking.user = {
            id: user._id,
            firstName: user.profile.firstName,
            middleName: user.profile.middleName,
            lastName: user.profile.lastName,
            email: user.emails[0].address,
            contact: user.profile.contact,
            image: user.profile.image
        };
        booking.startDate = new Date(booking.startDate);
        booking.endDate = new Date(booking.endDate);
        booking.bookingDate = new Date();
        booking.createdAt = new Date();
        booking.active = true;
        booking.confirmed = false;
        booking.completed = false;
        booking.cancelled = false;
        booking.deleted = false;

        try {
           var bookingId = Bookings.collection.insert(booking);
        } catch (err) {
            console.log(err.message);
            throw new Meteor.Error(500, "Error while creating new booking. Please resubmit after checking details.");
        }

        try {
          let tour = <Tour>Meteor.call("tours.findOne", {_id: booking.tour.id});
          tour.totalSoldSeats += booking.numOfTravellers;
          tour.totalAvailableSeats -= booking.numOfTravellers;

          let selDateRange = _.find(tour.dateRange, {_id: booking.tour.dateRangeId});
          selDateRange.soldSeats += booking.numOfTravellers;
          selDateRange.availableSeats -= booking.numOfTravellers;

            Tours.collection.update({_id: tour._id, "dateRange._id": selDateRange._id}, {$set: {
                totalSoldSeats: tour.totalSoldSeats,
                totalAvailableSeats: tour.totalAvailableSeats,
                "dateRange.$.soldSeats": selDateRange.soldSeats,
                "dateRange.$.availableSeats": selDateRange.availableSeats
            } });
        } catch (err) {
            console.log("Error while updating availability in tour object.")
            console.log(err.message);
        }
        return bookingId;
    },
    "bookings.find": (options: Options, criteria: any, searchString: string) => {
        userIsInRole(["customer"]);

        let userId = Meteor.userId();
        let where:any = [];
        where.push({
          "user.id": userId
        }, {
            "$or": [{deleted: false}, {deleted: {$exists: false} }]
        }, {
          "$or": [{active: true}, {active: {$exists: false} }]
        });

        if (!_.isEmpty(criteria)) {
          where.push(criteria);
        }

        // match search string
        if (typeof searchString === 'string' && searchString.length) {
            // allow search on firstName, lastName
            where.push({
                "$or": [
                    { "tour.name": { $regex: `.*${searchString}.*`, $options: 'i' } },
                    { "tour.departure": { $regex: `.*${searchString}.*`, $options: 'i' } },
                    { "tour.destination": { $regex: `.*${searchString}.*`, $options: 'i' } },
                    { "tour.tourType": { $regex: `.*${searchString}.*`, $options: 'i' } },
                    { "tour.tourPace": { $regex: `.*${searchString}.*`, $options: 'i' } },
                    { "tour.supplier.companyName": { $regex: `.*${searchString}.*`, $options: 'i' } }
                ]
            });
        }

        let cursor = Bookings.collection.find({$and: where}, options);
        return {count: cursor.count(), data: cursor.fetch()};
    },
    "bookings.findOne": (criteria: any, options: {with?: {supplier: boolean, tour: boolean}} = {}) => {
      userIsInRole(["customer"]);

      let userId = Meteor.userId();
      let where:any = [];
      where.push({
          "$or": [{deleted: false}, {deleted: {$exists: false} }]
      }, {
        "$or": [{active: true}, {active: {$exists: false} }]
      }, {
        "user.id": userId
      });
      if (_.isEmpty(criteria)) {
        criteria = { };
      }
      where.push(criteria);

      let booking = Bookings.collection.findOne({$and: where});

      if (_.isEmpty(booking)) {
        throw new Meteor.Error(404, "Invalid booking-id supplied.");
      }

      if (typeof options.with == "undefined") {
        return booking;
      }

      if (options.with.tour == true) {
        let data = Meteor.call("tours.findOne", {_id: booking.tour.id}, {with: {owner: true}});
        return {
          booking,
          tour: data.tour,
          supplier: data.owner,
        }
      }
    },
    "bookings.sendConfirmation": (bookingId) => {
      let booking = Bookings.collection.findOne({_id: bookingId});
      if (_.isEmpty(booking)) {
        return;
      }

      let from = "atorvia12@gmail.com";
      let to = booking.user.email;
      let subject = "New Booking Confirmation";
      let text = `Hi ${booking.user.firstName}, <br />
        Your booking order for tour name ${booking.tour.name} has been placed. <br />
        Please find tour details below: <br />
        <br />
        <ul>
        <li>Departure: ${booking.tour.departure}</li>
        <li>Destination: ${booking.tour.destination}</li>
        <li>Start Date: ${getFormattedDate(booking.startDate)} </li>
        <li>End Date: ${getFormattedDate(booking.endDate)} </li>
        <li>Num of Travellers: ${booking.numOfTravellers} </li>
        <li>Total Price: ${booking.totalPrice}</li>
        </ul>
        <p>Team Atorvia</p>
        `;
      Meteor.setTimeout(() => {
        Email.send({ to, from, subject, text});
      }, 0);

      let supplier = Meteor.users.findOne({_id: booking.tour.supplierId});
      if (_.isEmpty(supplier)) {
        return;
      }

      to = supplier.emails[0].address;
      subject = "New Booking Confirmation";
      text = `Hi ${supplier.profile.supplier.companyName}, <br />
      New booking order for tour name ${booking.tour.name} has been placed by ${booking.user.firstName} ${booking.user.lastName}. <br />
      Please find tour details below: <br />
      <br />
      <ul>
      <li>Departure: ${booking.tour.departure}</li>
      <li>Destination: ${booking.tour.destination}</li>
      <li>Start Date: ${getFormattedDate(booking.startDate)} </li>
      <li>End Date: ${getFormattedDate(booking.endDate)} </li>
      <li>Num of Travellers: ${booking.numOfTravellers} </li>
      <li>Total Price: ${booking.totalPrice}</li>
      </ul>
      <p>Team Atorvia</p>`;

      Meteor.setTimeout(() => {
        Email.send({ to, from, subject, text});
      }, 0);
    },
    "bookings.updateUser": (userId: string) => {
      let user = Meteor.users.findOne({_id: userId});
      if (_.isEmpty(user)) {
        console.log("Error calling bookings.updateUser(). Invalid userId supplied.")
        return;
      }

      Bookings.collection.update({"user.id": userId}, {
        $set: {
          "user.firstName": user.profile.firstName,
          "user.middleName": user.profile.middleName,
          "user.lastName": user.profile.lastName,
          "user.fullName": user.profile.fullName,
          "user.email": user.emails[0].address,
          "user.contact": user.profile.contact,
          "user.image": user.profile.image
        }
      }, {
        multi: true
      });
    }
});

function getFormattedDate(today) {
  var dd = today.getDate();
  var mm = today.getMonth()+1; //January is 0!

  var yyyy = today.getFullYear();
  if(dd<10){
      dd='0'+dd;
  }
  if(mm<10){
      mm='0'+mm;
  }
  return dd+'/'+mm+'/'+yyyy;
}
