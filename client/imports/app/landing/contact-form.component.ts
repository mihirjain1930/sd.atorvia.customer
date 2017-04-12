import { Component, OnInit, NgZone } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { CustomValidators as CValidators } from "ng2-validation";
import { Router } from '@angular/router';
import { Accounts } from 'meteor/accounts-base';
import { MeteorComponent } from 'angular2-meteor';
import { showAlert } from "../shared/show-alert";
import { validateEmail, validatePassword, validatePhoneNum, validateFirstName } from "../../validators/common";
import template from './contact-form.component.html';

@Component({
  selector: 'signup',
  template
})
export class ContactFormComponent extends MeteorComponent implements OnInit {
  contactForm: FormGroup;
  constructor(private router: Router, private zone: NgZone, private formBuilder: FormBuilder) {
    super();
  }

  ngOnInit() {
    this.contactForm = this.formBuilder.group({
      email: ['', Validators.compose([Validators.required, Validators.minLength(5), Validators.maxLength(50), validateEmail])],
      fullName: ['', Validators.compose([Validators.required, Validators.minLength(2), Validators.maxLength(30), validateFirstName])],
      phoneNum: ['', Validators.compose([Validators.required, Validators.minLength(7), Validators.maxLength(15), validatePhoneNum])],
      message: ['', Validators.compose([Validators.required, Validators.minLength(10), Validators.maxLength(300)])]
    })
  }

  sendQuery() {
    let subject = "Received query from " + fullName;
    this.call("sendEmail", email, "atorvia12@gmail.com", subject, "We will contact you soon.", (err, res) => {
      if (! err) {
        showAlert("Your messagehas been received. Someone from our team will contact you soon.", "success");
        this.router.navigate(['/']);
      } else {
        console.log("Error while sending email.", err);
      }
    })
    console.log("in contactus form control");
  }
}
