import { Component, Input, OnInit, AfterViewInit, AfterViewChecked, OnDestroy, OnChanges, NgZone, ChangeDetectorRef, SimpleChanges } from '@angular/core';
import { FormBuilder, FormGroup, FormControl, Validators as Validators } from '@angular/forms';
import { CustomValidators as CValidators } from "ng2-validation";
import { Router } from '@angular/router';
import { Accounts } from 'meteor/accounts-base';
import { Meteor } from 'meteor/meteor';
import { MeteorComponent } from 'angular2-meteor';
import { LocalStorageService, SessionStorageService } from 'ng2-webstorage';
import { showAlert } from "../shared/show-alert";
import template from './ask-question.html';
import * as _ from 'underscore';

declare var jQuery: any;
@Component({
  selector: 'ask-question',
  template
})
export class AskQuestionComponent extends MeteorComponent implements OnInit, AfterViewInit, AfterViewChecked, OnDestroy, OnChanges  {
  askAQuestionForm: FormGroup;
  error: string;
  constructor(private router: Router,
    private zone: NgZone,
    private formBuilder: FormBuilder,
    private localStorage: LocalStorageService,
    private sessionStorage: SessionStorageService,
    private changeDetectorRef: ChangeDetectorRef,
    ) {
    super();
  }

  ngOnInit () {
    this.askAQuestionForm = this.formBuilder.group({
      subject: ['', Validators.compose([Validators.required, Validators.minLength(5), Validators.maxLength(50) ])],
      message: ['', Validators.compose([Validators.required, Validators.minLength(8), Validators.maxLength(255) ])]
    });

    this.error = '';
  }

  askAQuestion() {

    let message = {
      subject: this.askAQuestionForm.value.subject,
      message: this.askAQuestionForm.value.message
    }
    jQuery(".modal").modal('hide');
    // this.call("sendMail.askAQuestion", message, (err, res) => {
    //   if (! err) {
    //     showAlert("Your message has been sent to supplier.", "success");
    //   } else {
    //     showAlert("Error while sending message to supplier. Please try again later", "danger");
    //   }
    // })
  }
}
