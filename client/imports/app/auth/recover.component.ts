import {Component, OnInit, NgZone} from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { Accounts } from 'meteor/accounts-base';
import {showAlert} from "../shared/show-alert";

import template from './recover.component.html';

@Component({
  selector: 'recover',
  template
})
export class RecoverComponent implements OnInit {
  recoverForm: FormGroup;
  error: string;

  constructor(private router: Router, private zone: NgZone, private formBuilder: FormBuilder) {}

  ngOnInit() {
    var emailRegex = "[_A-Za-z0-9-\\+]+(\\.[_A-Za-z0-9-]+)*@[A-Za-z0-9-]+(\\.[A-Za-z0-9]+)*(\\.[A-Za-z]{2,})";
    this.recoverForm = this.formBuilder.group({
      email: ['', Validators.compose([Validators.required, Validators.pattern(emailRegex)])]
    });

    this.error = '';
  }

  recover() {
    if (this.recoverForm.valid) {
      showAlert("Please wait...", "info");
      Accounts.forgotPassword({
        email: this.recoverForm.value.email
      }, (err) => {
        if (err) {
          this.zone.run(() => {
            this.error = err;
          });
        } else {
          showAlert("Reset password request initiated. Please check your email for further instructions.", "success");
          this.router.navigate(['/login']);
        }
      });
    }
  }
}
