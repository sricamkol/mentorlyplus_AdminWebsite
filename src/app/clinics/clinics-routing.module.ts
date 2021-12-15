import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { ClinicsComponent } from './clinics.component';
import { ClinicUpdateComponent } from './clinic-update/clinic-update.component';
import { JoinedUsersComponent } from './joined-users/joined-users.component';

const routes: Routes = [
  { path: '', component: ClinicsComponent },
  { path:'joined-users', component: JoinedUsersComponent },
  { path:'update', component: ClinicUpdateComponent },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ClinicsRoutingModule { }
