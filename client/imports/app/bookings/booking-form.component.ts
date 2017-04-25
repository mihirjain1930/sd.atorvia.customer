import { Component, Input, OnInit, AfterViewInit, AfterViewChecked, OnDestroy, OnChanges, NgZone, ChangeDetectorRef, SimpleChanges } from '@angular/core';
import { FormBuilder, FormGroup, FormControl, Validators as Validators } from '@angular/forms';
import { CustomValidators as CValidators } from "ng2-validation";
import { Router } from '@angular/router';
import { Accounts } from 'meteor/accounts-base';
import { Meteor } from 'meteor/meteor';
import { MeteorComponent } from 'angular2-meteor';
import { LocalStorageService, SessionStorageService } from 'ng2-webstorage';
import { Booking } from "../../../../both/models/booking.model";
import { Tour } from "../../../../both/models/tour.model";
import { showAlert } from "../shared/show-alert";
import template from './booking-form.html';
import * as _ from 'underscore';

interface DateRange {
  _id: string;
  startDate: Date;
  endDate: Date;
  price?: [{
    numOfPersons: number;
    adult: number;
    child: number;
  }],
  numOfSeats: number;
  soldSeats: number;
  availableSeats: number;
};
declare var jQuery: any;
@Component({
  selector: 'booking-form',
  template
})
export class BookingFormComponent extends MeteorComponent implements OnInit, AfterViewInit, AfterViewChecked, OnDestroy, OnChanges  {
  @Input() tour: Tour;
  booking: Booking;
  @Input() selDateRange: DateRange;
  bookingForm: FormGroup;
  error: string;

  constructor(private router: Router, private zone: NgZone, private formBuilder: FormBuilder, private localStorage: LocalStorageService, private sessionStorage: SessionStorageService, private changeDetectorRef: ChangeDetectorRef) {
    super();
  }

  ngOnInit() {
    let booking = <Booking> {};
    booking.numOfAdults = 1;
    booking.numOfChild = 0;
    booking.travellers = [];

    this.bookingForm = this.formBuilder.group({
      numOfAdults: [booking.numOfAdults, Validators.compose([Validators.required, CValidators.min(1), CValidators.max(30) ] ) ],
      numOfChild: [booking.numOfChild, Validators.compose([CValidators.max(30) ] ) ],
    });

    this.booking = booking;
  }

  ngAfterViewChecked() {
  }

  ngAfterViewInit() {
    Meteor.setTimeout(() => {
      jQuery(function($){

      });
    }, 500);
  }

  ngOnDestroy() {
  }

  ngOnChanges(changes: SimpleChanges) {
    let booking = this.booking;

    // only run when property "data" changed
    if (changes['selDateRange']) {
      let selDateRange = <DateRange> changes["selDateRange"].currentValue;
      if (selDateRange) {
        booking.startDate = selDateRange.startDate;
        booking.endDate = selDateRange.endDate;
        this.selDateRange = selDateRange;
        this.setBookingPrice();
      }
    }

    if (changes['tour']) {
      let tour = changes["tour"].currentValue;
      if (typeof tour !== "undefined") {
        this.tour = <Tour>tour;
        booking.tour = {
          id: tour._id,
          supplierId: tour.owner.id,
          name: tour.name,
          departure: tour.departure,
          destination: tour.destination,
          featuredImage: tour.featuredImage,
          noOfNights: tour.noOfNights,
          totalMeals: tour.totalMeals,
          cancellationPolicy: tour.cancellationPolicy,
          refundPolicy: tour.refundPolicy
        };
      }

    }
  }

  detectChanges() {
    this.changeDetectorRef.detectChanges();
  }

  setBookingPrice() {
    let booking = this.booking;
    let selDateRange = this.selDateRange;
    let numOfAdults = this.bookingForm.value.numOfAdults;
    let numOfChild = this.bookingForm.value.numOfChild;
    // console.log(selDateRange);

    let selPrice = _.find(selDateRange.price, {numOfPersons: numOfAdults});
    if (typeof selPrice == "undefined") {
      if (numOfAdults >= 5) {
        selPrice = selDateRange.price[4];
      } else {
        selPrice = selDateRange.price[0];
      }
    }
    let selPrice2 = _.find(selDateRange.price, {numOfPersons: numOfChild});
    if (typeof selPrice2 == "undefined") {
      if (numOfChild >= 5) {
        selPrice2 = selDateRange.price[4];
      } else {
        selPrice2 = selDateRange.price[0];
      }
    }

    booking.numOfAdults = numOfAdults;
    booking.numOfChild = numOfChild;
    booking.numOfTravellers = numOfAdults + numOfChild;
    booking.pricePerAdult = selPrice.adult;
    booking.pricePerChild = selPrice2.child;
    booking.totalPrice = (numOfAdults * selPrice.adult) + (numOfChild * selPrice2.child);
    // console.log(booking);

    this.detectChanges();
  }

  doBooking() {
    let booking = this.booking;
    booking.numOfTravellers = booking.numOfAdults + booking.numOfChild;
    booking.tour.dateRangeId = this.selDateRange._id;
    this.sessionStorage.store("bookingDetails", this.booking);
    let bookingDetails = this.sessionStorage.retrieve("bookingDetails");
      if (bookingDetails) {
        this.zone.run(() => {
          jQuery(".modal").modal('hide');
          this.router.navigate(['/booking/step1']);
        });
      } else {
        showAlert("Error while saving data. Please try after restarting your browser.", "danger");
      }

  }

}
