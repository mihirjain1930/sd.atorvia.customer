import { Component, OnInit, AfterViewInit, AfterViewChecked, OnDestroy, NgZone } from '@angular/core';
import { Router } from '@angular/router';
import { Accounts } from 'meteor/accounts-base';
import { Meteor } from 'meteor/meteor';
import { MeteorComponent } from 'angular2-meteor';
import { CompleterService, CompleterData, CompleterItem } from 'ng2-completer';
import { ChangeDetectorRef } from "@angular/core";
import { Tour } from "../../../../both/models/tour.model";
import { isValidEmail } from "../../../../both/validators/index";
import { showAlert } from "../shared/show-alert";
import template from './landing.html';

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

  constructor(private zone: NgZone, private router: Router, private completerService: CompleterService, private changeDetectorRef: ChangeDetectorRef) {
    super();
    this.dataService = completerService.remote('/api/1.0/tours/search?searchString=', 'destination', 'name');
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
            console.log("Error while fetching pages list.", "danger");
            return;
        }

        this.hotItems = res.data;
        this.changeDetectorRef.detectChanges();
    });

    where = {active: true, approved: true};
    let limit = 8;
    this.call("tours.findTopDestinations", where, limit, (err, res) => {
        if (err) {
            console.log("Error while fetching pages list.", "danger");
            return;
        }
        this.topItems = res;
        this.changeDetectorRef.detectChanges();
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

  navigateTour(item: CompleterItem) {
    // console.log(item);
    if (! item || ! item.originalObject) {
      return;
    }
    let slug = item.originalObject.slug;
    this.router.navigate(['/tours', slug]);
  }
}
