import { Component, OnInit, AfterViewInit, AfterViewChecked, OnDestroy, NgZone } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { Accounts } from 'meteor/accounts-base';
import { Meteor } from 'meteor/meteor';
import { MeteorComponent } from 'angular2-meteor';
import { Observable, Subscription, Subject, BehaviorSubject } from "rxjs";
import { Tour } from "../../../../both/models/tour.model";
import { User } from "../../../../both/models/user.model";
import { showAlert } from "../shared/show-alert";
import template from './view.html';

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
export class TourViewComponent extends MeteorComponent implements OnInit, AfterViewInit, AfterViewChecked, OnDestroy {
  paramsSub: Subscription;
  query: string;
  error: string;
  item: Tour;
  owner: User;
  numOfTours: number;

  constructor(private zone: NgZone, private router: Router, private route: ActivatedRoute) {
    super();
  }

  ngOnInit() {
    this.paramsSub = this.route.params
      .map(params => params['name'])
      .subscribe(name => {
          this.query = name;

          this.call("tours.findOne", {slug: this.query}, {with: {owner: true}}, (err, res) => {
            if (err) {
              showAlert(err.reason, "danger");
              return;
            }

            this.item = <Tour>res.tour;
            this.owner = <User>res.owner;
            this.numOfTours = res.numOfTours;
          })
        });
  }

  ngAfterViewChecked() {
  }

  ngAfterViewInit() {
    Meteor.setTimeout(() => {
      jQuery(function($){
        $('.slider-wrap').slick({
          infinite: true,
          slidesToShow: 3,
          slidesToScroll: 3,
          centerPadding: '30px',
          speed: 300,
           responsive: [

            {
              breakpoint: 992,
              settings: {
                slidesToShow: 2,
                slidesToScroll: 2
              }
            },
            {
              breakpoint: 600,
              settings: {
                slidesToShow: 1,
                slidesToScroll: 1
              }
            }
          ]
        })
        $("a[rel^='prettyPhoto']").prettyPhoto({
          social_tools: false
        });
      });
    }, 500);
  }

  ngOnDestroy() {
  }

  get tour() {
    return this.item;
  }

}
