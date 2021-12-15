import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { AsyncPipe } from '@angular/common';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';

import { environment } from '../environments/environment';

import { AgmCoreModule } from '@agm/core';

import { AngularFireModule } from '@angular/fire';
import { AngularFireMessagingModule } from '@angular/fire/messaging';
import { AngularFireDatabaseModule } from '@angular/fire/database';
import { AngularFireAuthModule } from '@angular/fire/auth';


import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDatepickerModule, MatNativeDateModule, MatFormFieldModule, MatInputModule, MatSnackBarModule } from '@angular/material';

import { ChartsModule } from 'ng2-charts';
import { NgxPaginationModule } from 'ngx-pagination';
import { NgSelect2Module } from 'ng-select2';
import { LoadingBarHttpClientModule } from '@ngx-loading-bar/http-client';
import { SweetAlert2Module } from '@sweetalert2/ngx-sweetalert2';
import { FullCalendarModule } from '@fullcalendar/angular';
import { DeviceDetectorModule } from 'ngx-device-detector';
import { MomentTimezonePickerModule } from 'moment-timezone-picker';

import { AuthGuard } from './services/auth.guard';
import { ServiceInterceptor } from './services/service.interceptor';
import { ApiService } from './services/api.service';
import { MessagingService } from './services/messaging.service';

import { AppRoutingModule } from './app-routing.module';
import { AppointmentsModule } from './appointments/appointments.module';
import { CanDeactivateGuard } from 'src/app/services/can-deactivate-guard.service';

import { AppComponent } from './app.component';
import { LoginComponent } from './login/login.component';
import { HeaderComponent } from './shared/components/header/header.component';
import { SidebarComponent } from './shared/components/sidebar/sidebar.component';
import { FooterComponent } from './shared/components/footer/footer.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { ForgetPasswordComponent } from './forget-password/forget-password.component';
import { ResetPasswordComponent } from './reset-password/reset-password.component';
import { UpdateProfileComponent } from './update-profile/update-profile.component';
import { ChangePasswordComponent } from './change-password/change-password.component';
import { DrugCatalogComponent } from './drug-catalog/drug-catalog.component';
import { CareersComponent } from './careers/careers.component';
import { ContactUsComponent } from './contact-us/contact-us.component';

import { NgxAgoraModule, AgoraConfig } from 'ngx-agora';
const agoraConfig: AgoraConfig = {AppID: environment.agoraAppID};

@NgModule({
  declarations: [
    AppComponent,
    LoginComponent,
    HeaderComponent,
    SidebarComponent,
    FooterComponent,
    ForgetPasswordComponent,
    ResetPasswordComponent,
    UpdateProfileComponent,
    ChangePasswordComponent,
    DashboardComponent,
    DrugCatalogComponent,
    CareersComponent,
    ContactUsComponent,
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    FormsModule,
    ReactiveFormsModule,
    HttpClientModule,
    LoadingBarHttpClientModule,
    SweetAlert2Module.forRoot(),
    FullCalendarModule,
    BrowserAnimationsModule,
    AngularFireDatabaseModule,
    AngularFireAuthModule,
    AngularFireMessagingModule,
    AngularFireModule.initializeApp(environment.firebase),
    DeviceDetectorModule.forRoot(),
    MatTooltipModule,
    MatDatepickerModule, MatNativeDateModule, MatFormFieldModule, MatInputModule,
    MomentTimezonePickerModule,
    NgxPaginationModule,
    NgSelect2Module,
    MatSnackBarModule,
    ChartsModule,
    AgmCoreModule.forRoot({
      apiKey: environment.googleMapApiKey,
      libraries: ["places"]
    }),
    NgxAgoraModule.forRoot(agoraConfig),
    AppointmentsModule
  ],
  providers: [
    AuthGuard,
    ApiService,
    MessagingService,
    AsyncPipe,
    {
      provide: HTTP_INTERCEPTORS,
      useClass: ServiceInterceptor,
      multi: true
    },
    CanDeactivateGuard
  ],
  bootstrap: [AppComponent]

})
export class AppModule { }
