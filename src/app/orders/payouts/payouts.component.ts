import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Title } from '@angular/platform-browser';
import { OrdersService } from '../../services/orders.service';

@Component({
  selector: 'app-payouts',
  templateUrl: './payouts.component.html',
  styleUrls: ['./payouts.component.css']
})
export class PayoutsComponent implements OnInit {
  itemsPerPage: number = 5;
  currentPage: number = 1;
  totalItems: number;
  ordersData = [];

  constructor(
    private ordersService: OrdersService,
    private title: Title,
  ) {
    this.title.setTitle('Payouts');
  }

  ngOnInit() {
    this.orders_total();
  }

  orders_total() {
    this.ordersService.orders_total({"order_for":'Transfer'}).subscribe(
      (response: any) => {
        if (response.status) {
          this.totalItems = response.data;
		  if(this.totalItems > 0) this.orders_get();
		  else this.ordersData = [];
        }
      }
    )
  }

  orders_get(){
    this.ordersService.orders_get({"order_for":'Transfer', "limit": this.itemsPerPage, "page": this.currentPage}).subscribe(
      (response:any)=>{
        if(response.status){
          this.ordersData = response.data;
        }
      }
    )
  }

  pageChanged(p: number) {
    this.currentPage = p;
    this.orders_total();
  }
}
