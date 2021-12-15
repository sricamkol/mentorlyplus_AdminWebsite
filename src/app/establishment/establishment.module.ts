import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgxPaginationModule } from 'ngx-pagination';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDatepickerModule, MatNativeDateModule, MatFormFieldModule, MatInputModule } from '@angular/material';
import { SweetAlert2Module } from '@sweetalert2/ngx-sweetalert2';

import { EstablishmentRoutingModule } from './establishment-routing.module';
import { EstablishmentComponent } from './establishment.component';

@NgModule({
  declarations: [EstablishmentComponent],
  imports: [
    EstablishmentRoutingModule,
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    NgxPaginationModule,
    MatTooltipModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatFormFieldModule,
    MatInputModule,
    SweetAlert2Module
  ]
})
export class EstablishmentModule { }
