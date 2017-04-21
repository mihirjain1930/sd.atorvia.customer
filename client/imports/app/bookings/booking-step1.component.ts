import { Component, OnInit, AfterViewInit, AfterViewChecked, OnDestroy, NgZone } from '@angular/core';
import { FormBuilder, FormGroup, Validators as Validators } from '@angular/forms';
import { CustomValidators as CValidators } from "ng2-validation";
import { Router } from '@angular/router';
import { Accounts } from 'meteor/accounts-base';
import { Meteor } from 'meteor/meteor';
import { MeteorComponent } from 'angular2-meteor';
import { LocalStorageService, SessionStorageService } from 'ng2-webstorage';
import { validateEmail, validatePhoneNum, validateFirstName, validatePassportNum } from "../../validators/common";
import { Booking } from "../../../../both/models/booking.model";
import { Tour } from "../../../../both/models/tour.model";
import { showAlert } from "../shared/show-alert";
import template from './booking-step1.component.html';

@Component({
  selector: '',
  template
})
export class BookingStep1Component extends MeteorComponent implements OnInit, AfterViewInit, AfterViewChecked, OnDestroy  {
  bookingForm: FormGroup
  booking: Booking;
  tour: Tour;
  constructor(private router: Router, private zone: NgZone, private formBuilder: FormBuilder, private localStorage: LocalStorageService, private sessionStorage: SessionStorageService) {
    super();
  }

  ngOnInit() {
    this.booking = <Booking>this.sessionStorage.retrieve("bookingDetails");
    this.bookingForm = this.formBuilder.group({
      travellers: this.formBuilder.array([
      ]),
      // addressLine1: ['', Validators.compose([Validators.required])],
      // addressLine2: ['', Validators.compose([])],
      // suburb: ['', Validators.compose([Validators.required])],
      // postcode: ['', Validators.compose([Validators.required])],
      // state: ['', Validators.compose([Validators.required])],
      // country: ['', Validators.compose([Validators.required])],
      nameOnCard: ['', Validators.compose([Validators.required])],
      cardNumber: ['', Validators.compose([Validators.required, CValidators.creditCard])],
      expiryDate: ['', Validators.compose([Validators.required])],
      cvvNumber:  ['', Validators.compose([Validators.required,Validators.minLength(3),Validators.maxLength(3)])]
    });
    this.loadTravellers();
  }

  ngAfterViewChecked() {
  }

  ngAfterViewInit() {
    Meteor.setTimeout(() => {
      jQuery(function($){
        var leftImage = $(".tour-details").parent().height();
        var rightImage = $(".fee-summary").parent().height();

        $(".tour-details").css("height", rightImage +"px");
      });
    }, 500);
  }

  ngOnDestroy() {
  }

  get bookingDetails() {
    return this.booking;
  }

  private loadTravellers() {
    let booking = this.booking;
    let numOfTravellers = <number>booking.numOfTravellers;
    for(let i=0; i<numOfTravellers; i++) {
      this.addTraveller(i);
    }
  }

  private initTraveller(i) {
    let travellers = this.booking.travellers;
    if (typeof travellers[i] == "undefined") {
      travellers[i] = {};
    }

    return this.formBuilder.group({
      firstName: [travellers[i].firstName, Validators.compose([Validators.required, validateFirstName, Validators.minLength(2), Validators.maxLength(30)])],
      middleName: [travellers[i].middleName, Validators.compose([validateFirstName, Validators.minLength(2), Validators.maxLength(30)])],
      lastName: [travellers[i].lastName, Validators.compose([Validators.required, validateFirstName, Validators.minLength(2), Validators.maxLength(30)])],
      email: [travellers[i].email, Validators.compose([Validators.required, validateEmail, Validators.minLength(5), Validators.maxLength(50)])],
      contact: [travellers[i].contact, Validators.compose([Validators.required, validatePhoneNum, Validators.minLength(7), Validators.maxLength(15)])],
      passportCountry: [travellers[i].passportCountry, Validators.compose([Validators.required])],
      passportNumber: [travellers[i].passportNumber, Validators.compose([Validators.required, validatePassportNum, Validators.minLength(7), Validators.maxLength(15)])],
      specialRequest: [travellers[i].specialRequest, Validators.compose([])]
    });
  }

  private addTraveller(i) {
    const control = <FormArray>this.bookingForm.controls['travellers'];
    control.push(this.initTraveller(i));
  }

  book() {
    let travellers = this.bookingForm.value.travellers;
    let paymentData = {
      nameOnCard: this.bookingForm.value.nameOnCard,
      cardNumber: this.bookingForm.value.cardNumber,
      expiryDate: this.bookingForm.value.expiryDate,
      cvvNumber:  this.bookingForm.value.cvvNumber,
    }
    // let billingAddress = {
    //   addressLine1: this.bookingForm.value.addressLine1,
    //   addressLine2: this.bookingForm.value.addressLine2,
    //   suburb: this.bookingForm.value.suburb,
    //   state: this.bookingForm.value.state,
    //   postcode: this.bookingForm.value.postcode,
    //   country: this.bookingForm.value.country
    // }
    console.log("paymentData",paymentData);
    this.router.navigate(['/booking/step2']);
  }
}
