import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ContentLoaderModule } from '@ngneat/content-loader';
import { SweetAlert2Module } from '@sweetalert2/ngx-sweetalert2';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { FullCalendarModule } from '@fullcalendar/angular';
import { NgxPaginationModule } from 'ngx-pagination';
import { MatTooltipModule } from '@angular/material/tooltip';
import { NgSelect2Module } from 'ng-select2';
import { MatDatepickerModule, MatNativeDateModule, MatFormFieldModule, MatInputModule } from '@angular/material';
import { NgxMaterialTimepickerModule } from 'ngx-material-timepicker';

import { AppointmentsRoutingModule } from './appointments-routing.module';
import { CanDeactivateGuard } from 'src/app/services/can-deactivate-guard.service';

import { AppointmentsComponent } from './appointments.component';
import { AppointmentCalendarComponent } from './appointment-calendar/appointment-calendar.component';
import { ConsultComponent } from './consult/consult.component';
import { DetailComponent } from './detail/detail.component';
import { MarkCompletedComponent } from './mark-completed/mark-completed.component';

@NgModule({
  declarations: [
    AppointmentsComponent,
    AppointmentCalendarComponent,
    ConsultComponent,
    DetailComponent,
    MarkCompletedComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    AppointmentsRoutingModule,
    ContentLoaderModule,
    SweetAlert2Module,
    FullCalendarModule,
    NgxPaginationModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatFormFieldModule,
    MatInputModule,
    NgxMaterialTimepickerModule,
    MatTooltipModule,
    NgSelect2Module
  ],
  exports: [
    AppointmentCalendarComponent
  ],
  providers: [
    CanDeactivateGuard
  ]
})
export class AppointmentsModule { }
