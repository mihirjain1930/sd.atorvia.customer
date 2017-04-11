import { Component, OnInit, AfterViewInit, AfterViewChecked, OnDestroy, NgZone } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { Accounts } from 'meteor/accounts-base';
import { Meteor } from 'meteor/meteor';
import { MeteorComponent } from 'angular2-meteor';
import { Observable, Subscription, Subject, BehaviorSubject } from "rxjs";
import { PaginationService } from "ng2-pagination";
import template from './search.html';
import { Tour } from "../../../../both/models/tour.model";
import { isValidEmail } from "../../../../both/validators/index";
import { showAlert } from "../shared/show-alert";

declare var jQuery:any;
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
  items: Tour[];
  pageSize: Subject<number> = new Subject<number>();
  curPage: Subject<number> = new Subject<number>();
  orderBy: Subject<string> = new Subject<string>();
  nameOrder: Subject<number> = new Subject<number>();
  optionsSub: Subscription;
  itemsSize: number = -1;
  searchSubject: Subject<string> = new Subject<string>();
  searchString: string = "";
  whereCond: Subject<any> = new Subject<any>();

  constructor(private zone: NgZone, private route: ActivatedRoute, private paginationService: PaginationService) {
    super();
  }

  ngOnInit() {
    this.paramsSub = this.route.params
      .map(params => params['query'])
      .subscribe(query => {
          this.searchString = query;

          if (! this.searchString) {
            //console.log("no page-id supplied");
          }

          this.setOptions();
        });
  }

  ngAfterViewChecked() {
  }

  ngAfterViewInit() {
    Meteor.setTimeout(() => {
      jQuery(function($){
        $("#price-range").slider({
          range: true,
          min: 0,
          max: 200000,
          values: [0, 200000],
          slide: function(event, ui) {
            $("#priceRange").val("$" + ui.values[0] + " - $" + ui.values[1]);
          }
        });
        $("#priceRange").val("$" + $("#price-range").slider("values", 0) + " - $" + $("#price-range").slider("values", 1));
      });
    }, 500);
  }

  ngOnDestroy() {
  }

  private setOptions() {
      let options = {
          limit: 10,
          curPage: 1,
          orderBy: "createdAt",
          nameOrder: -1,
          searchString: this.searchString,
          where: {"active": true, "approved": true}
      }

      this.setOptionsSub();

      this.paginationService.register({
      id: "tours",
      itemsPerPage: 10,
      currentPage: options.curPage,
      totalItems: this.itemsSize
      });

      this.pageSize.next(options.limit);
      this.curPage.next(options.curPage);
      this.orderBy.next(options.orderBy);
      this.nameOrder.next(options.nameOrder);
      this.searchSubject.next(options.searchString);
      this.whereCond.next(options.where);
  }

  private setOptionsSub() {
      this.optionsSub = Observable.combineLatest(
          this.pageSize,
          this.curPage,
          this.orderBy,
          this.nameOrder,
          this.whereCond,
          this.searchSubject
      ).subscribe(([pageSize, curPage, orderBy, nameOrder, where, searchString]) => {
          //console.log("inside subscribe");
          const options: Options = {
              limit: pageSize as number,
              skip: ((curPage as number) - 1) * (pageSize as number),
              sort: { [orderBy]: nameOrder as number }
          };

          this.paginationService.setCurrentPage("tours", curPage as number);
          this.searchString = searchString;
          jQuery(".loading").show();
          this.call("tours.find", options, where, searchString, (err, res) => {
              jQuery(".loading").hide();
              if (err) {
                  showAlert("Error while fetching tours list.", "danger");
                  return;
              }
              this.items = res.data;
              // console.log(res.data);
              this.itemsSize = res.count;
              this.paginationService.setTotalItems("tours", this.itemsSize);
          })
      });
  }

  onPageChanged(page: number): void {
      this.curPage.next(page);
  }

  changeOrderBy(sortBy: string): void {
    switch(sortBy) {
      case 'Tour (A-Z)':
      this.orderBy.next("name");
      this.nameOrder.next(1);
      break;
      case 'Tour (Z-A)':
      this.orderBy.next("name");
      this.nameOrder.next(-1);
      break;
      case 'Length (ASC)':
      this.orderBy.next("noOfDays");
      this.nameOrder.next(1);
      break;
      case 'Length (DESC)':
      this.orderBy.next("noOfDays");
      this.nameOrder.next(-1);
      break;
      case 'Availability (ASC)':
      this.orderBy.next("totalSeats");
      this.nameOrder.next(1);
      break;
      case 'Availability (DESC)':
      this.orderBy.next("totalSeats");
      this.nameOrder.next(-1);
      break;
      case 'Price From (ASC)':
      this.orderBy.next("dateRange.price.adult");
      this.nameOrder.next(1);
      break;
      case 'Price From (DESC)':
      this.orderBy.next("dateRange.price.adult");
      this.nameOrder.next(-1);
      break;
      default:
      this.orderBy.next("createdAt");
      this.nameOrder.next(-1);
      break;
    }
  }

  changeSortOrder(nameOrder: string): void {
      this.nameOrder.next(parseInt(nameOrder));
  }
}
