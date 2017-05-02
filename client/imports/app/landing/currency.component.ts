import { Component, Input, OnInit } from '@angular/core';
import { Meteor } from 'meteor/meteor';
import { MeteorComponent } from 'angular2-meteor';
import { ChangeDetectorRef } from "@angular/core";
import { LocalStorageService, SessionStorageService } from 'ng2-webstorage';
import { Currencies } from "../../../../both/collections/currencies.collection";
import { CurrencyService } from "../../services/currency";
import * as _ from 'underscore';

@Component({
  selector: 'currency',
  template: '<span style="display:inline;" [innerHTML]="symbol"></span>{{amount}}'
})
export class CurrencyComponent extends MeteorComponent implements OnInit {
  symbol: string = '<i class="fa fa-usd" aria-hidden="true"></i>';
  @Input()
  amount: number = null;
  defaultCode: string = "USD";
  @Input()
  currencyCode: string = "";
  @Input()
  convert: boolean = true;

  constructor(private sessionStorage: SessionStorageService, private currency: CurrencyService) {
    super();
  }

  ngOnInit() {
    if (this.convert === true) {
      if (this.doConversion()) {
        this.setCurrencyIcon();
      }
    } else {
      this.setCurrencyIcon();
    }
  }

  doConversion() {
    let currencyCode = this.sessionStorage.retrieve("currency");
    let defaultCode = this.defaultCode;

    if (this.currencyCode.length) {
      currencyCode = this.currencyCode;
    }

    if (! currencyCode || currencyCode == defaultCode) {
      return;
    }

    let hasData = Currencies.find({from: defaultCode, to: currencyCode}).fetch().length;
    if (hasData) {
      this.amount = this.currency.convert(this.amount, currencyCode);
      return true;
    } else {
      return false;
    }
  }

  setCurrencyIcon() {
    let currencyCode = this.sessionStorage.retrieve("currency");
    if (this.currencyCode.length) {
      currencyCode = this.currencyCode;
    }

    switch(currencyCode) {
      case "INR":
      this.symbol = '<i class="fa fa-inr" aria-hidden="true"></i>';
      break;
      case "AUD":
      this.symbol = 'A<i class="fa fa-dollar" aria-hidden="true"></i>';
      break;
      case "USD":
      this.symbol = '<i class="fa fa-dollar" aria-hidden="true"></i>';
      break;
      case "CAD":
      this.symbol = 'C<i class="fa fa-dollar" aria-hidden="true"></i>';
      break;
      case "EUR":
      this.symbol = '<i class="fa fa-euro" aria-hidden="true"></i>';
      break;
      case "GBP":
      this.symbol = '<i class="fa fa-gbp" aria-hidden="true"></i>';
      break;
    }
  }
}
