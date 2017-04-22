import { Meteor } from "meteor/meteor";
import { Bookings } from "../../both/collections/bookings.collection";
import { Booking } from "../../both/models/booking.model";

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

        return Bookings.collection.insert(booking);
    }
})