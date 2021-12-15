import { Component, ViewEncapsulation, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { ApiService } from './services/api.service'
import { CommonService } from './services/common.service';
import { MessagingService } from './services/messaging.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
  encapsulation: ViewEncapsulation.None
})
export class AppComponent implements AfterViewInit {
  @ViewChild('mycontainer', {static: true}) mycontainer: ElementRef;
  userToken='';

  constructor(
    private router: Router,
    private apiService: ApiService,
    private commonService: CommonService,
    private messagingService: MessagingService
  ) {
    //this.angularFireMessaging.requestToken.subscribe();
  }

  ngOnInit() {
	  this.apiService.currentUserData.subscribe(
      (userData:any) => {
        this.userToken = (userData.token) ? userData.token : this.commonService.getUserData('token');
        if(this.userToken) {
          this.commonService.setLoggedInObservable(true);
          this.mycontainer.nativeElement.classList.add('page-body-wrapper');
        } else {
          this.mycontainer.nativeElement.classList.remove('page-body-wrapper');
        }
      }
    );
    this.messagingService.requestPermission()
    this.messagingService.receiveMessage();
    //this.message = this.messagingService.currentMessage
  }

  ngAfterViewInit() {
    this.router.events.subscribe((evt) => {
      if (!(evt instanceof NavigationEnd)) {
          return;
      }
      window.scrollTo(0, 0);
    });
  }

}
