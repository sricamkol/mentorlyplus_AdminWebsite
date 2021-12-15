import { Component, OnInit } from '@angular/core';
import { OrdersService } from '../services/orders.service';
import { FormGroup, FormBuilder, Validators, NgForm } from '@angular/forms';
import { Router } from '@angular/router';
import { Title } from '@angular/platform-browser';

import { MomentDateAdapter, MAT_MOMENT_DATE_ADAPTER_OPTIONS } from '@angular/material-moment-adapter';
import { DateAdapter, MAT_DATE_FORMATS, MAT_DATE_LOCALE } from '@angular/material/core';
import * as _moment from 'moment';
const moment = _moment;
export const MY_FORMATS = {
  parse: {
    dateInput: 'LL',
  },
  display: {
    dateInput: 'DD/MM/YYYY',
    monthYearLabel: 'MMM YYYY',
    dateA11yLabel: 'LL',
    monthYearA11yLabel: 'MMMM YYYY',
  }
};

@Component({
  selector: 'app-orders',
  templateUrl: './orders.component.html',
  styleUrls: ['./orders.component.css'],
  providers: [
    {
      provide: DateAdapter,
      useClass: MomentDateAdapter,
      deps: [MAT_DATE_LOCALE, MAT_MOMENT_DATE_ADAPTER_OPTIONS]
    },
    {provide: MAT_DATE_FORMATS, useValue: MY_FORMATS}
  ]
})
export class OrdersComponent implements OnInit {
  popoverToggle:boolean=false;
  orderListingLoader:boolean=false;
  itemsPerPage: number = 10;
  currentPage: number = 1;
  totalItems: number = null;
  orders = [];
  searchForm: FormGroup;
  search:string='';
  order_for:string='Appointment,Product,Service';
  from_date='';
  to_date='';

  constructor(
    private ordersService: OrdersService,
    private title: Title,
    private formBuilder: FormBuilder
  ) {
    this.title.setTitle('Orders');
  }

  ngOnInit() {
    this.total_orders();
    this.searchForm = this.formBuilder.group({
      search: [''],
	  order_for: ['Appointment,Product,Service'],
      to_date:[''],
      from_date:[''],
    });
  }

  total_orders() {
    this.ordersService.orders_total({"order_for":this.order_for, "from_date":this.from_date, "to_date":this.to_date, 'search':this.search}).subscribe(
      (response: any) => {
        this.totalItems = response.data;
		if(this.totalItems > 0) this.getOrders();
		else this.orders = [];
      }
    )
  }

  getOrders(){
	  this.orderListingLoader = true;
    this.ordersService.orders_get({"order_for":this.order_for, "limit": this.itemsPerPage, "page": this.currentPage, "ob_key": "order_date", "ob_value": "DESC",'search':this.search, "from_date":this.from_date, "to_date":this.to_date }).subscribe(
      (response:any)=>{
        if(response.status) this.orders = response.data;
		      this.orderListingLoader = false;
      }
    )
  }

  pageChanged(p: number) {
    this.currentPage = p;
    this.total_orders();
    this.popoverToggle = false;
    //this.togglePopover();
  }

  clearFilter(){
    this.togglePopover();
    this.searchForm.patchValue({'search':'', 'order_for':'', 'from_date':'','to_date':''});
    this.search ='';
	  this.order_for = ''
    this.from_date = '';
    this.to_date = '';
    this.total_orders();
    this.togglePopover();
  }

  togglePopover() {
    if(this.popoverToggle) this.popoverToggle = false;
    else this.popoverToggle = true;
  }

  onSubmitSearchForm() {
    this.search = this.searchForm.value.search;
	this.order_for = this.searchForm.value.order_for;
	if(this.searchForm.value.from_date)
		this.from_date = this.searchForm.value.from_date.format("YYYY-MM-DD");
    if(this.searchForm.value.to_date)
		this.to_date = this.searchForm.value.to_date.format("YYYY-MM-DD");
    this.total_orders();
    this.togglePopover();
  }

}
