import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ContentLoaderModule } from '@ngneat/content-loader';
import { NgSelect2Module } from 'ng-select2';
import { AgmCoreModule } from '@agm/core';
import { NgxPaginationModule } from 'ngx-pagination';
import { MatTooltipModule } from '@angular/material/tooltip';

import { environment } from '../../environments/environment';

import { ClinicsRoutingModule } from './clinics-routing.module';
import { ClinicsComponent } from './clinics.component';
import { ClinicUpdateComponent } from './clinic-update/clinic-update.component';
import { DoctorsComponent } from './doctors/doctors.component';
import { PatientsComponent } from './patients/patients.component';
import { AppointmentsComponent } from './appointments/appointments.component';
import { JoinedUsersComponent } from './joined-users/joined-users.component';

@NgModule({
  declarations: [
    ClinicsComponent,
    ClinicUpdateComponent,
    DoctorsComponent,
    PatientsComponent,
    AppointmentsComponent,
    JoinedUsersComponent
  ],
  imports: [
    CommonModule,
    ClinicsRoutingModule,
    FormsModule,
    ReactiveFormsModule,
    ContentLoaderModule,
    NgSelect2Module,
    NgxPaginationModule,
    AgmCoreModule.forRoot({
      apiKey: environment.googleMapApiKey,
      libraries: ["places"]
    }),
    MatTooltipModule
  ]
})
export class ClinicsModule { }
