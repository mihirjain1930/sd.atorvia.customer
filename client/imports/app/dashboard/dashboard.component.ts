import { Component, OnInit, NgZone } from '@angular/core';
import { Meteor } from "meteor/meteor";
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { CustomValidators as CValidators } from "ng2-validation";
import { InjectUser } from "angular2-meteor-accounts-ui";
import { Router } from '@angular/router';
import { MeteorComponent } from 'angular2-meteor';
import { User } from "../../../../both/models/user.model";
import { showAlert } from "../shared/show-alert";
import { validateEmail, validatePassword, validatePhoneNum, validateFirstName } from "../../validators/common";
import template from "./dashboard.html";

@Component({
  selector: "dashboard",
  template
})
@InjectUser('user')
export class DashboardComponent extends MeteorComponent implements OnInit {
  accountForm: FormGroup;
  userId: string;
  error: string;

  constructor(private router: Router, private zone: NgZone, private formBuilder: FormBuilder) {
    super();
    if (! Meteor.userId()) {
      this.router.navigate(['/login']);
    }
  }

  ngOnInit() {
    if (!! Meteor.userId()) {
      this.userId = Meteor.userId();
      this.accountForm = this.formBuilder.group({
        email: ['', Validators.compose([Validators.required, Validators.minLength(5), Validators.maxLength(50), CValidators.email])],
        firstName: ['', Validators.compose([Validators.required, Validators.minLength(2), Validators.maxLength(30), validateFirstName])],
        middleName: ['', Validators.compose([Validators.required, Validators.minLength(2), Validators.maxLength(30), validateFirstName])],
        lastName: ['', Validators.compose([Validators.required, Validators.minLength(2), Validators.maxLength(30), validateFirstName])],
        phoneNum: ['', Validators.compose([Validators.required, Validators.minLength(7), Validators.maxLength(15), validatePhoneNum])],
      });
      let accountForm = this.accountForm;
      let callback = (user) => {
        //console.log("user:", user);
        accountForm.controls['firstName'].setValue(user.profile.firstName);
        accountForm.controls['middleName'].setValue(user.profile.middleName);
        accountForm.controls['lastName'].setValue(user.profile.lastName);
        accountForm.controls['email'].setValue(user.emails[0].address);
        accountForm.controls['phoneNum'].setValue(user.profile.contact);
      };
      this.fetchUser(callback);
    }
  }

  // find logged-in user data as not available page-load on client
  private fetchUser(callback) {
    //console.log("call users.findOne()")
    this.call("users.findOne", (err, res) => {
        if (err) {
            return;
        }
        //console.log("users.findOne():", res);
        callback(res);
    });
  }

  //update user from dashboard
  update() {
    let fullName = this.accountForm.value.firstName;
    if(this.accountForm.value.middleName) {
      fullName  = fullName + " " +this.accountForm.value.middleName;
    }
    fullName = fullName + " " +this.accountForm.value.lastName;
    let userData = {
      "profile.firstName": this.accountForm.value.firstName,
      "profile.middleName": this.accountForm.value.middleName,
      "profile.lastName": this.accountForm.value.lastName,
      "profile.contact": this.accountForm.value.phoneNum,
      "profile.fullName": fullName,
    };
    this.call("users.update", userData, (err, res) => {
      this.zone.run(() => {
        if(err) {
            this.error = err;
        } else {
          showAlert("Your profile has been updated successfully.", "success");
          this.router.navigate(['/dashboard']);
        }
      });
    });
  }
}
