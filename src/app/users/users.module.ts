import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgxPaginationModule } from 'ngx-pagination';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDatepickerModule, MatNativeDateModule, MatFormFieldModule, MatInputModule } from '@angular/material';
import { SweetAlert2Module } from '@sweetalert2/ngx-sweetalert2';

import { UsersRoutingModule } from './users-routing.module';

import { UsersComponent } from './users.component';
import { UpdateUserComponent } from './update-user/update-user.component';
import { HealthRecordComponent } from './health-record/health-record.component';


@NgModule({
  declarations: [
    UsersComponent,
    UpdateUserComponent,
    HealthRecordComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    UsersRoutingModule,
    NgxPaginationModule,
    MatTooltipModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatFormFieldModule,
    MatInputModule,
    SweetAlert2Module
  ]
})
export class UserModule { }
