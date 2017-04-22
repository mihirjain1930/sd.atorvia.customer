import { Component, OnInit, AfterViewInit, AfterViewChecked, OnDestroy, NgZone } from '@angular/core';
import { FormBuilder, FormGroup, FormArray, Validators as Validators } from '@angular/forms';
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
      travellers[i] = {
        passport: {}
      };
    }

    return this.formBuilder.group({
      firstName: [travellers[i].firstName, Validators.compose([Validators.required, validateFirstName, Validators.minLength(2), Validators.maxLength(30)])],
      middleName: [travellers[i].middleName, Validators.compose([validateFirstName, Validators.minLength(2), Validators.maxLength(30)])],
      lastName: [travellers[i].lastName, Validators.compose([Validators.required, validateFirstName, Validators.minLength(2), Validators.maxLength(30)])],
      email: [travellers[i].email, Validators.compose([Validators.required, validateEmail, Validators.minLength(5), Validators.maxLength(50)])],
      contact: [travellers[i].contact, Validators.compose([Validators.required, validatePhoneNum, Validators.minLength(7), Validators.maxLength(15)])],
      addressLine1: [travellers[i].addressLine1, Validators.compose([Validators.required, Validators.minLength(2), Validators.maxLength(50)])],
      addressLine2: [travellers[i].addressLine2, Validators.compose([Validators.minLength(2), Validators.maxLength(50)])],
      suburb: [travellers[i].state, Validators.compose([Validators.required, Validators.minLength(2), Validators.maxLength(30)])],
      postCode: [travellers[i].postCode, Validators.compose([Validators.required, Validators.minLength(4), Validators.maxLength(12)])],
      state: [travellers[i].state, Validators.compose([Validators.required, Validators.minLength(2), Validators.maxLength(30)])],
      country: [travellers[i].country, Validators.compose([Validators.required, Validators.minLength(2), Validators.maxLength(30)])],
      passportCountry: [travellers[i].passport.country, Validators.compose([Validators.required])],
      passportNumber: [travellers[i].passport.number, Validators.compose([Validators.required, validatePassportNum, Validators.minLength(7), Validators.maxLength(15)])],
      specialRequest: [travellers[i].specialRequest, Validators.compose([])],
    });
  }

  private addTraveller(i) {
    const control = <FormArray>this.bookingForm.controls['travellers'];
    control.push(this.initTraveller(i));
  }

  resetStateValue() {
    this.bookingForm.controls['travellers'].controls[0].controls["state"].setValue(null);
  }

  book() {
    let travellers = this.bookingForm.value.travellers;
    let cardDetails = {
      nameOnCard: this.bookingForm.value.nameOnCard,
      cardNumber: this.bookingForm.value.cardNumber,
      expiryDate: this.bookingForm.value.expiryDate,
      cvvNumber:  this.bookingForm.value.cvvNumber,
    }
    let booking = this.booking;
    booking.travellers = travellers;

    // save booking data into session
    this.sessionStorage.store("bookingDetails", this.booking);
    this.call("bookings.insert", booking, (err, res) => {
      if (err) {
        showAlert(err.reason, "danger");
        return;
      }

      this.zone.run(() => {
        showAlert("Thank you for booking your trip with us. You will receive confirmation email very soon.", "success")
        this.router.navigate(['/booking/step2']);
      });
    });
    
  }
}
