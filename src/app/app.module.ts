import { AgoraConfig, NgxAgoraModule } from 'ngx-agora';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HTTP_INTERCEPTORS, HttpClientModule } from '@angular/common/http';
import { MatDatepickerModule, MatFormFieldModule, MatInputModule, MatNativeDateModule, MatSnackBarModule } from '@angular/material';

import { AgmCoreModule } from '@agm/core';
import { AngularFireAuthModule } from '@angular/fire/auth';
import { AngularFireDatabaseModule } from '@angular/fire/database';
import { AngularFireMessagingModule } from '@angular/fire/messaging';
import { AngularFireModule } from '@angular/fire';
import { ApiService } from './services/api.service';
import { AppComponent } from './app.component';
import { AppRoutingModule } from './app-routing.module';
import { AppointmentsModule } from './appointments/appointments.module';
import { AsyncPipe } from '@angular/common';
import { AuthGuard } from './services/auth.guard';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { BrowserModule } from '@angular/platform-browser';
import { CanDeactivateGuard } from 'src/app/services/can-deactivate-guard.service';
import { CareersComponent } from './careers/careers.component';
import { ChangePasswordComponent } from './change-password/change-password.component';
import { ChartsModule } from 'ng2-charts';
import { ContactUsComponent } from './contact-us/contact-us.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { DeviceDetectorModule } from 'ngx-device-detector';
import { DrugCatalogComponent } from './drug-catalog/drug-catalog.component';
import { FooterComponent } from './shared/components/footer/footer.component';
import { ForgetPasswordComponent } from './forget-password/forget-password.component';
import { FullCalendarModule } from '@fullcalendar/angular';
import { HeaderComponent } from './shared/components/header/header.component';
import { LoadingBarHttpClientModule } from '@ngx-loading-bar/http-client';
import { LoginComponent } from './login/login.component';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MessagingService } from './services/messaging.service';
import { MomentTimezonePickerModule } from 'moment-timezone-picker';
import { NgModule } from '@angular/core';
import { NgSelect2Module } from 'ng-select2';
import { NgxPaginationModule } from 'ngx-pagination';
import { ResetPasswordComponent } from './reset-password/reset-password.component';
import { ServiceInterceptor } from './services/service.interceptor';
import { SidebarComponent } from './shared/components/sidebar/sidebar.component';
import { SweetAlert2Module } from '@sweetalert2/ngx-sweetalert2';
import { UpdateProfileComponent } from './update-profile/update-profile.component';
import { environment } from '../environments/environment';

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
      libraries: ['places']
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
