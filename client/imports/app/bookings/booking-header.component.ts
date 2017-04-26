import { Component, Input, OnInit, AfterViewInit } from '@angular/core';
import { Meteor } from 'meteor/meteor';
import { MeteorComponent } from 'angular2-meteor';
import { Booking } from "../../../../both/models/booking.model";
import { Tour } from "../../../../both/models/tour.model";
import template from './booking-header.html';

@Component({
  selector: 'booking-header',
  template
})
export class BookingHeaderComponent extends MeteorComponent {
    @Input() tour: Tour;
    @Input() booking: Booking;
    tax: number;
    constructor() {
        super();
    }

    get bookingDetails() {
      let booking = this.booking;
      let taxPrice = booking.totalPrice;
      let tax = (10/100) * taxPrice;
      booking.tax = tax;
      this.booking = booking;
      return this.booking;
    }
}
