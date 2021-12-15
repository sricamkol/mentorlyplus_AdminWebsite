import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { MatTooltipModule } from '@angular/material/tooltip';
import { ContentLoaderModule } from '@ngneat/content-loader';
import { SweetAlert2Module } from '@sweetalert2/ngx-sweetalert2';
import { FullCalendarModule } from '@fullcalendar/angular';
import { NgxPaginationModule } from 'ngx-pagination';
import { NgSelect2Module } from 'ng-select2';
import { MatDatepickerModule, MatNativeDateModule, MatFormFieldModule, MatInputModule} from '@angular/material';
import { NgxMaterialTimepickerModule } from 'ngx-material-timepicker';
import { NgxMatDatetimePickerModule, NgxMatTimepickerModule } from '@angular-material-components/datetime-picker';
import { AngularEditorModule } from '@kolkov/angular-editor';

import { SettingsRoutingModule } from './settings-routing.module';
import { CitiesComponent } from './cities/cities.component';
import { EmailTemplateComponent } from './email-template/email-template.component';
import { RegionsComponent } from './regions/regions.component';
import { SpecializationsComponent } from './specializations/specializations.component';
import { WebSettingComponent } from './web-setting/web-setting.component';
import { CountriesComponent } from './countries/countries.component';
import { FaqComponent } from './faq/faq.component';
import { SymptomsComponent } from './symptoms/symptoms.component';
import { DiseasesComponent } from './diseases/diseases.component';

@NgModule({
  declarations: [
    CitiesComponent,
    EmailTemplateComponent,
    RegionsComponent,
    SpecializationsComponent,
    WebSettingComponent,
    CountriesComponent,
    FaqComponent,
    SymptomsComponent,
    DiseasesComponent,
  ],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    ContentLoaderModule,
    SweetAlert2Module,
    FullCalendarModule,
    NgxPaginationModule,
    SettingsRoutingModule,
    NgSelect2Module,
    NgxPaginationModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatFormFieldModule,
    MatInputModule,
    NgxMaterialTimepickerModule,
    NgxMatDatetimePickerModule,
    NgxMatTimepickerModule,
    MatTooltipModule,
    AngularEditorModule,
  ],
  exports: []
})
export class SettingsModule { }
