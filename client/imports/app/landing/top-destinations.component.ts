import { Component, OnInit, AfterViewInit, AfterViewChecked, OnDestroy, NgZone } from '@angular/core';
import { Router } from '@angular/router';
import { Accounts } from 'meteor/accounts-base';
import { Meteor } from 'meteor/meteor';
import { MeteorComponent } from 'angular2-meteor';
import template from './top-destinations.html';
import { Tour } from "../../../../both/models/tour.model";
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
export class TopDestinationsComponent extends MeteorComponent implements OnInit, AfterViewInit, AfterViewChecked, OnDestroy {
  error: string;
  topItems: Tour[];

  constructor(private zone: NgZone, private router: Router) {
    super();
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

}
