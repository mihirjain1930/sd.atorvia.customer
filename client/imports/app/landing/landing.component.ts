import { Component, OnInit, AfterViewInit, AfterViewChecked, OnDestroy, NgZone } from '@angular/core';
import { Router } from '@angular/router';
import { Accounts } from 'meteor/accounts-base';
import { Meteor } from 'meteor/meteor';
import { MeteorComponent } from 'angular2-meteor';
import { CompleterService, CompleterData } from 'ng2-completer';
import template from './landing.html';
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
export class LandingComponent extends MeteorComponent implements OnInit, AfterViewInit, AfterViewChecked, OnDestroy {
  topItems: Tour[];
  hotItems: Tour[];
  error: string;
  dataService: CompleterData;

  constructor(private zone: NgZone, private router: Router, private completerService: CompleterService) {
    super();
    this.dataService = completerService.remote('/api/1.0/tours/search?searchString=', 'name,departure,destination', 'name');
  }

  ngOnInit() {
    const options: Options = {
        limit: 8,
        skip: 0,
        sort: { "createdAt": -1 }
    };
    let where = {active: true, approved: true};

    this.call("tours.find", options, where, "", (err, res) => {
        if (err) {
            showAlert("Error while fetching pages list.", "danger");
            return;
        }

        this.topItems = res.data;
        this.hotItems = res.data;
    })
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

  doSearch(searchString) {
    if (typeof searchString == "undefined" || searchString.length == 0) {
      this.error = "Search field can't be blank.";
      return;
    }
    this.zone.run(() => {
      this.router.navigate(['/tours/search', searchString]);
    });
  }

  doSubscribe(input) {
    let email = input.value;
    let validEmail = isValidEmail(email);
    if (! validEmail) {
      showAlert("Please enter a valid email.", "danger");
      return;
    }

    this.call("subscribers.insert", email, "landing", (err, res) => {
      if (err) {
        showAlert(err.reason, "danger");
      } else {
        input.value = "";
        showAlert("Thank you for subscribing to our website.", "success");
      }
    })
  }
}
