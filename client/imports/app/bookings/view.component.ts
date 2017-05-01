import { Component, OnInit, AfterViewInit, NgZone } from '@angular/core';
import { Meteor } from "meteor/meteor";
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { CustomValidators as CValidators } from "ng2-validation";
import { InjectUser } from "angular2-meteor-accounts-ui";
import { Router, ActivatedRoute } from '@angular/router';
import { MeteorComponent } from 'angular2-meteor';
import { Observable, Subscription, Subject, BehaviorSubject } from "rxjs";
import { ChangeDetectorRef } from "@angular/core";
import { User } from "../../../../both/models/user.model";
import { Tour } from "../../../../both/models/tour.model";
import { Booking } from "../../../../both/models/booking.model";
import { showAlert } from "../shared/show-alert";
import * as moment from 'moment';
import template from "./view.html";

declare var jQuery:any;

@Component({
  selector: "",
  template
})
@InjectUser('user')
export class BookingViewComponent extends MeteorComponent implements OnInit, AfterViewInit {
  booking: Booking = null;
  tour: Tour = null;
  supplier: User = null
  error: string = null;
  activeTab: string = "overview";

  constructor(private zone: NgZone, private route: ActivatedRoute, private changeDetectorRef: ChangeDetectorRef) {
    super();
  }

  ngOnInit() {
    this.paramsSub = this.route.params
    .map(params => params['id'])
    .subscribe(id => {

      this.call("bookings.findOne", {_id: id}, {with: {supplier: true, tour: true}}, (err, res) => {
        if (err) {
          console.log(err.reason, "danger");
          return;
        }

        this.booking = <Booking>res.booking;
        this.tour = <Tour>res.tour;
        this.supplier = <User>res.supplier;

        this.changeDetectorRef.detectChanges();
      });

    });
  }

  ngAfterViewInit() {
  }

  detectChanges() {
    this.changeDetectorRef.detectChanges();
  }

  get departInDays() {
    let booking = this.booking;
    let a = moment(booking.startDate);
    let b = moment(new Date());
    let diff = a.diff(b, 'days');
    if (diff < 0) {
      diff = 0;
    }
    return diff;
  }

  get bookingStatus() {
    let retVal = null;
    let booking = this.booking;
    if (booking.confirmed !== true) {
        retVal = "Pending";
    } else if (booking.confirmed === true && this.booking.completed !== true) {
        retVal = "Confirmed";
    } else if (booking.completed === true) {
        retVal = "Completed";
    }

    return retVal;
  }
}
