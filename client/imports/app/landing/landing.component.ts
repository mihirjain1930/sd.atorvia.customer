import { Component, OnInit, AfterViewInit, AfterViewChecked, OnDestroy, NgZone } from '@angular/core';
import { Router } from '@angular/router';
import { Accounts } from 'meteor/accounts-base';
import { Meteor } from 'meteor/meteor';
import { MeteorComponent } from 'angular2-meteor';
import template from './landing.html';

@Component({
  selector: '',
  template
})
export class LandingComponent extends MeteorComponent implements OnInit, AfterViewInit, AfterViewChecked, OnDestroy {

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
