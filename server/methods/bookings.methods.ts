import { Meteor } from "meteor/meteor";
import { Tours } from "../../both/collections/tours.collection";
import { Tour } from "../../both/models/tour.model";
import { Bookings } from "../../both/collections/bookings.collection";
import { Booking } from "../../both/models/booking.model";
import { Transactions } from "../../both/collections/transactions.collection";
import * as _ from 'underscore';

Meteor.methods({
    "bookings.insert": (booking: Booking) => {
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
    "bookings.findOne": (criteria: any) => {
      let where:any = [];
      where.push({
          "$or": [{deleted: false}, {deleted: {$exists: false} }]
      }, {
        "$or": [{active: true}, {active: {$exists: false} }]
      });
      if (_.isEmpty(criteria)) {
        criteria = { };
      }
      where.push(criteria);

      return Bookings.collection.findOne({$and: where});
    },
    
})
