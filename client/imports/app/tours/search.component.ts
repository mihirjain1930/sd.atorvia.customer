import { Component, OnInit, AfterViewInit, AfterViewChecked, OnDestroy, NgZone } from '@angular/core';
import { Router } from '@angular/router';
import { Accounts } from 'meteor/accounts-base';
import { Meteor } from 'meteor/meteor';
import { MeteorComponent } from 'angular2-meteor';
import template from './search.html';
import { Tour } from "../../../../both/models/tour.model";
import { isValidEmail } from "../../../../both/validators/index";
import { showAlert } from "../shared/show-alert";

interface Pagination {
  limit: number;
  skip: number;
}

interface Options extends Pagination {
  [key: string]: any
}

@Component({
  selector: '',
  template
})
export class SearchComponent extends MeteorComponent implements OnInit, AfterViewInit, AfterViewChecked, OnDestroy {

  constructor(private zone: NgZone) {
    super();
  }

  ngOnInit() {
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

}
