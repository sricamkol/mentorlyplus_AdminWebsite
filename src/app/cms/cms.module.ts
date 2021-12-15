import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ContentLoaderModule } from '@ngneat/content-loader';
import { SweetAlert2Module } from '@sweetalert2/ngx-sweetalert2';
import { NgxPaginationModule } from 'ngx-pagination';

import { CmsRoutingModule } from './cms-routing.module';
import { ManageMenusComponent } from './manage-menus/manage-menus.component';
import { ManageContentComponent } from './manage-content/manage-content.component';
import { ManageSlidersComponent } from './manage-sliders/manage-sliders.component';
import { SpecialityComponent } from './speciality/speciality.component';
import { AngularEditorModule } from '@kolkov/angular-editor';


@NgModule({
  declarations: [
    ManageMenusComponent,
    ManageContentComponent,
    ManageSlidersComponent,
    SpecialityComponent,
  ],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    ContentLoaderModule,
    SweetAlert2Module,
    NgxPaginationModule,
    CmsRoutingModule,
    AngularEditorModule,
  ]
})
export class CmsModule { }
