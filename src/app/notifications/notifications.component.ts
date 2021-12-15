import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { Title } from '@angular/platform-browser';

import { NotificationService } from '../services/notification.service';

@Component({
  selector: 'app-notifications',
  templateUrl: './notifications.component.html',
  styleUrls: ['./notifications.component.css'],
  encapsulation: ViewEncapsulation.None
})
export class NotificationsComponent implements OnInit {
  notifications=[];
  constructor(
    private title: Title,
    private notificationService: NotificationService
  ) {
    this.title.setTitle('Notifications');
  }

  ngOnInit() {
    this.notificationService.get().subscribe(
      (response:any)=>{
        if(response.status) {
          this.notifications = response.data;
        }
      }
    );
  }

}
