import { RouterModule, Routes } from '@angular/router';

import { AuthGuard } from './services/auth.guard';
import { CareersComponent } from './careers/careers.component';
import { ChangePasswordComponent } from './change-password/change-password.component';
import { ContactUsComponent } from './contact-us/contact-us.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { DrugCatalogComponent } from './drug-catalog/drug-catalog.component';
import { ForgetPasswordComponent } from './forget-password/forget-password.component';
import { LoginComponent } from './login/login.component';
import { NgModule } from '@angular/core';
import { ResetPasswordComponent } from './reset-password/reset-password.component';
import { UpdateProfileComponent } from './update-profile/update-profile.component';

const routes: Routes = [
  { path: '', component: LoginComponent },
  { path: 'login', component: LoginComponent },
  { path: 'reset-password/:code', component: ResetPasswordComponent },
  { path: 'forget-password', component: ForgetPasswordComponent, canActivate: [AuthGuard] },
  { path: 'update-profile', component: UpdateProfileComponent, canActivate: [AuthGuard] },
  { path: 'change-password', component: ChangePasswordComponent, canActivate: [AuthGuard] },
  { path: 'dashboard', component: DashboardComponent, canActivate: [AuthGuard] },
  { path: 'careers', component: CareersComponent , canActivate: [AuthGuard] },
  { path: 'contact-us', component: ContactUsComponent , canActivate: [AuthGuard] },
  { path: 'drug-catalog', component: DrugCatalogComponent, canActivate: [AuthGuard] },

  { path: 'articles', loadChildren: () => import('./article/article.module').then(m => m.ArticleModule), canActivate: [AuthGuard] },
  { path: 'healthfeeds', loadChildren: () => import('./article/article.module').then(m => m.ArticleModule), canActivate: [AuthGuard] },

  { path: 'doctors', loadChildren: () => import('./doctors/doctors.module').then(m => m.DoctorsModule), canActivate: [AuthGuard] },
  // tslint:disable-next-line:max-line-length
  { path: 'appointments', loadChildren: () => import('./appointments/appointments.module').then(m => m.AppointmentsModule), canActivate: [AuthGuard] },
  { path: 'feedbacks', loadChildren: () => import('./feedbacks/feedbacks.module').then(m => m.FeedbacksModule), canActivate: [AuthGuard] },
  // tslint:disable-next-line:max-line-length
  { path: 'notifications', loadChildren: () => import('./notifications/notifications.module').then(m => m.NotificationsModule), canActivate: [AuthGuard] },
  { path: 'settings', loadChildren: () => import('./settings/settings.module').then(m => m.SettingsModule), canActivate: [AuthGuard] },
  // tslint:disable-next-line:max-line-length
  { path: 'my-establishments', loadChildren: () => import('./clinics/clinics.module').then(m => m.ClinicsModule), canActivate: [AuthGuard] },
  { path: 'establishment', loadChildren: () => import('./clinics/clinics.module').then(m => m.ClinicsModule), canActivate: [AuthGuard] },

  { path: 'establishments', loadChildren: () => import('./establishment/establishment.module').then(m => m.EstablishmentModule) },

  { path: 'orders', loadChildren: () => import('./orders/orders.module').then(m => m.OrdersModule), canActivate: [AuthGuard] },
  { path: 'cms', loadChildren: () => import('./cms/cms.module').then(m => m.CmsModule), canActivate: [AuthGuard] },
  { path: 'patients', loadChildren: () => import('./users/users.module').then(m => m.UserModule), canActivate: [AuthGuard] },
  { path: 'user', loadChildren: () => import('./users/users.module').then(m => m.UserModule), canActivate: [AuthGuard] },
  { path: '**', redirectTo: '/' },
];

@NgModule({
  imports: [RouterModule.forRoot(routes, {scrollPositionRestoration: 'enabled',useHash: true})],
  exports: [RouterModule]
})
export class AppRoutingModule { }
