import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { AppointmentsComponent } from './appointments.component';
import { AppointmentCalendarComponent } from './appointment-calendar/appointment-calendar.component';
import { ConsultComponent } from './consult/consult.component';
import { CanDeactivateGuard } from '../services/can-deactivate-guard.service';

const routes: Routes = [
  { path: '', component: AppointmentsComponent },
  { path: 'calendar', component: AppointmentCalendarComponent },
  { path: 'consult/:appointment_id', component: ConsultComponent, canDeactivate: [CanDeactivateGuard] },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AppointmentsRoutingModule { }
