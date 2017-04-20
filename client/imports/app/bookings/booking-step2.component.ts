import { Component, OnInit, AfterViewInit, AfterViewChecked, OnDestroy, NgZone } from '@angular/core';
import { FormBuilder, FormGroup, Validators as Validators } from '@angular/forms';
import { CustomValidators as CValidators } from "ng2-validation";
import { Router } from '@angular/router';
import { Accounts } from 'meteor/accounts-base';
import { Meteor } from 'meteor/meteor';
import { MeteorComponent } from 'angular2-meteor';
import { LocalStorageService, SessionStorageService } from 'ng2-webstorage';
import { validateEmail, validatePassword } from "../../validators/common";
import { showAlert } from "../shared/show-alert";
import template from './booking-step2.component.html';

@Component({
  selector: '',
  template
})
export class BookingStep2Component extends MeteorComponent implements OnInit, AfterViewInit, AfterViewChecked, OnDestroy  {

  constructor(private router: Router, private zone: NgZone, private formBuilder: FormBuilder, private localStorage: LocalStorageService, private sessionStorage: SessionStorageService) {
    super();
  }

  ngAfterViewChecked() {
  }

  ngOnInit() {
    
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
}
