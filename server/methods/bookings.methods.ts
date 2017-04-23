import { Meteor } from "meteor/meteor";
import { Tours } from "../../both/collections/tours.collection";
import { Tour } from "../../both/models/tour.model";
import { Bookings } from "../../both/collections/bookings.collection";
import { Booking } from "../../both/models/booking.model";
import * as _ from 'underscore';

Meteor.methods({
    "bookings.insert": (booking: Booking) => {
        booking.userId = Meteor.userId();
        booking.paymentDate = new Date();
        booking.createdAt = new Date();
        booking.active = true;
        booking.confirmed = false;
        booking.completed = false;
        booking.cancelled = false;
        booking.deleted = false;

        try {
            Bookings.collection.insert(booking);
        } catch (err) {
            throw new Meteor.Error(500, "Error while creating new booking. Please resubmit after checking details.");
        }

        let tour = <Tour>Meteor.call("tours.findOne", {_id: booking.tour.id});
        tour.totalSoldSeats += booking.numOfTravellers;
        tour.totalAvailableSeats -= booking.numOfTravellers;

        let selDateRange = _.find(tour.dateRange, {_id: booking.tour.dateRangeId});
        selDateRange.soldSeats += booking.numOfTravellers;
        selDateRange.availableSeats -= booking.numOfTravellers;
        
        try {
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
    }
})