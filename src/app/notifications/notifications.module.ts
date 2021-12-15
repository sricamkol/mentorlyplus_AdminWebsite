import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ContentLoaderModule } from '@ngneat/content-loader';

import { NotificationsRoutingModule } from './notifications-routing.module';
import { NotificationsComponent } from './notifications.component';
import { NotificationCardComponent } from './notification-card/notification-card.component';


@NgModule({
  declarations: [
    NotificationsComponent,
    NotificationCardComponent
  ],
  imports: [
    CommonModule,
    NotificationsRoutingModule,
    ContentLoaderModule
  ]
})
export class NotificationsModule { }
