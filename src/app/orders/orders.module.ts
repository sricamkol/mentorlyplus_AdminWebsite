import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { OrdersRoutingModule } from './orders-routing.module';
import { OrdersComponent } from './orders.component';

import { SweetAlert2Module } from '@sweetalert2/ngx-sweetalert2';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgxPaginationModule } from 'ngx-pagination';
import { OrderDetailComponent } from './order-detail/order-detail.component';
import { PayoutsComponent } from './payouts/payouts.component';
import { MatDatepickerModule, MatNativeDateModule, MatFormFieldModule, MatInputModule } from '@angular/material';

@NgModule({
  declarations: [OrdersComponent, OrderDetailComponent, PayoutsComponent],
  imports: [
    CommonModule,
    OrdersRoutingModule,
    NgxPaginationModule,
    FormsModule,
    ReactiveFormsModule,
    SweetAlert2Module,
    MatDatepickerModule,
    MatNativeDateModule,
    MatFormFieldModule,
    MatInputModule
  ]
})
export class OrdersModule { }
