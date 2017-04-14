import { Component, OnInit, AfterViewInit, AfterViewChecked, OnDestroy, NgZone } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { Accounts } from 'meteor/accounts-base';
import { Meteor } from 'meteor/meteor';
import { MeteorComponent } from 'angular2-meteor';
import { Observable, Subscription, Subject, BehaviorSubject } from "rxjs";
import template from './view.html';
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
export class TourViewComponent extends MeteorComponent implements OnInit, AfterViewInit, AfterViewChecked, OnDestroy {
  paramsSub: Subscription;
  query: string;
  error: string;

  constructor(private zone: NgZone, private router: Router, private route: ActivatedRoute) {
    super();
  }

  ngOnInit() {
    this.paramsSub = this.route.params
      .map(params => params['name'])
      .subscribe(name => {
          this.query = name;
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
      });
    }, 500);
  }

  ngOnDestroy() {
  }

}
