import { Meteor } from 'meteor/meteor';
import { Injectable, NgZone } from '@angular/core';
import { LocalStorageService, SessionStorageService } from 'ng2-webstorage';
import { Currencies } from "../../../both/collections/currencies.collection";
import * as _ from 'underscore';

@Injectable()
export class CurrencyService {
  defaultCode = "USD";
  constructor(private localStorage: LocalStorageService) {
  }

  get currencyCode() {
    let currency = this.localStorage.retrieve("currencyCode");
    if (currency && currency.length) {
      return currency;
    } else {
      return this.defaultCode;
    }
  }

  convert(amount, customCode="") {
    let currencyCode = this.localStorage.retrieve("currencyCode");
    if (customCode && customCode.length) {
      currencyCode = customCode;
    }

    let defaultCode = this.defaultCode;
    if (! currencyCode || currencyCode == defaultCode) {
      return amount;
    }

    let exchange = Currencies.findOne({from: defaultCode, to: currencyCode});
    // console.log(exchange);
    if (_.isEmpty(exchange)) {
      return amount;
    }
    return Math.floor(amount * exchange.value);
  }
}
