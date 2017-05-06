import { Meteor } from "meteor/meteor";
import { Accounts } from 'meteor/accounts-base';
import { Roles } from 'meteor/alanning:roles';
import { check } from "meteor/check";
import { Email } from 'meteor/email';
import { HTTP } from "meteor/http";
import { Currencies } from "../../both/collections/currencies.collection";

declare var cheerio: any;

Meteor.methods({
  "sendEmail": (to: string, subject: string, text: string) => {
      let from = "atorvia12@gmail.com";
      return Email.send({ to, from, subject, text});
  },
  "sendEmailCustom": (to: string, subject: string, text: string) => {
      let Mailgun = require('mailgun').Mailgun;
      let email = new Mailgun('key-755f427d33296fe30862b0278c460e84');
      let domain = "sandbox3f697e79ae2849f5935a5a60e59f9795.mailgun.org";

      email.sendText("noreply@atorvia.com", to, subject, text, domain, (err) => {
        if (err) {
          console.log(err);
        }
      });
  },
  "syncExchangeRates": () => {
    let from = "USD";
    let toArr = [
      'INR',
      'AUD',
      'CAD',
      'EUR',
      'GBP'
    ];

    for(let i=0; i<toArr.length; i++) {
      let to = toArr[i];

      HTTP.call("POST", `https://www.google.com/finance/converter?a=1&from=${from}&to=${to}`, {
        data: {
        }
      }, (error, result) => {
        let cheerio = require("cheerio");
        let $ = cheerio.load(result.content);
        // console.log(result.content);
        let value = Number($('.bld').text().trim().split(" ") [0]);

        let createdAt = new Date();
        Currencies.upsert({
          from,
          to
        }, {
          $set: { value, createdAt }
        });

      })
    }
  }
});
