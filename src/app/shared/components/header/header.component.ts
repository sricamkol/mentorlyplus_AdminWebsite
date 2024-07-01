import { AfterViewInit, Component, OnInit, ViewEncapsulation } from '@angular/core';

import { AlertService } from '../../../services/alert.service';
import { ApiService } from '../../../services/api.service';
import { CommonService } from '../../../services/common.service';
import { NotificationService } from '../../../services/notification.service';
import { Observable } from 'rxjs';
import Swal from 'sweetalert2';
import { UserClinicsService } from '../../../services/user-clinics.service';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css'],
  encapsulation: ViewEncapsulation.None
})
export class HeaderComponent implements OnInit, AfterViewInit {

  isloggedInObservable$: Observable<boolean>;
  token = '';
  userName = '';
  userImage = '';
  message = '';
  userType = '';
  created_by = '';
  clinic_id = '';
  clinics = [];
  online_status = 'Offline';
  settings: any;
  notificationData = [];

  find_in = 'session';
  storage_type = false;
  localUserData: any;

  site_url = environment.site_url;

  constructor(
    private commonService: CommonService,
    private apiService: ApiService,
    private userClinicsService: UserClinicsService,
    private notificationService: NotificationService,
    private alertService: AlertService,
  ) {
    this.isloggedInObservable$ = this.commonService.isloggedInObservable;
  }

  ngOnInit() {
    this.getAllNotification();
    this.apiService.currentUserData.subscribe(
      (userData: any) => {
        console.log(userData);
        const title = userData.title ? userData.title : this.commonService.getUserData('title');
        const firstName = userData.first_name ? userData.first_name : this.commonService.getUserData('first_name');
        const lastName = userData.last_name ? userData.last_name : this.commonService.getUserData('last_name');
        this.token = (userData.token) ? userData.token : this.commonService.getUserData('token');
        this.userName = (title ? title : '') + ' ' + firstName + ' ' + lastName;
        this.userImage = userData.profile_image_url ? userData.profile_image_url : this.commonService.getUserData('profile_image_url');
        this.userType = (userData.group_name) ? userData.group_name : this.commonService.getUserData('group_name');
        this.created_by = (userData.created_by) ? userData.created_by : this.commonService.getUserData('created_by');
        this.clinic_id = (userData.clinic_id) ? userData.clinic_id : this.commonService.getUserData('clinic_id');
        this.settings = (userData.settings) ? userData.settings : this.commonService.getUserData('settings');
        this.clinics = (userData.clinics) ? userData.clinics : this.commonService.getUserData('clinics');
        // tslint:disable-next-line:max-line-length
        this.localUserData = (Object.keys(userData).length && userData.constructor === Object) ? userData : this.commonService.getUserData();
        this.online_status = this.settings.hasOwnProperty('online_status') ? this.settings.online_status : 'Offline';
        // console.log('this.settings', this.settings);
        // console.log('this.online_status', this.online_status);
        // console.log('this.clinics', this.clinics);
      }
    );
    this.find_in = localStorage.getItem('find_in');
    if (this.find_in === 'local') {
      this.storage_type = true;
    }
  }

  ngAfterViewInit() {}

  getAllNotification() {
    const token = this.commonService.getUserData('token');
    if (token !== '') {
      this.notificationService.get({limit: 5}).subscribe(
        (response: any) => {
          if (response.status) {
            this.notificationData = response.data;
          }
        }
      );
    }
  }

  onLogout() {
    Swal.fire({
      title: 'Logout',
      text: 'Are you sure?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'OK',
      cancelButtonText: 'Cancel',
      allowOutsideClick: false,
      allowEscapeKey: false,
      allowEnterKey: false
    }).then((result) => {
      if (result.value) {
        this.apiService.logout();
      }
    });
  }

  changeOnlineStatus(index: string) {
    let meta_value = this.online_status;
    let clinic_id = '';
    let clinic_name = '';
    let alertTitle = '';
    let responseTitle = '';
    if (index === 'Offline') {
      meta_value = 'Offline';
      alertTitle = 'Change status to offline';
      responseTitle = 'You are offline';
    } else {
      meta_value = 'Online';
      clinic_id = this.clinics[index].clinic_id;
      clinic_name = this.clinics[index].clinic_name;
      alertTitle = 'Change status to ' + meta_value + ' for ' + clinic_name;
      responseTitle = 'You are ' + meta_value + ' for ' + clinic_name;
    }

    Swal.fire({
      title: alertTitle,
      text: 'Are you sure?',
      icon: 'info',
      showCancelButton: true,
      confirmButtonText: 'OK',
      cancelButtonText: 'Cancel',
      allowOutsideClick: false,
      allowEscapeKey: false,
      allowEnterKey: false
    }).then((result) => {
      if (result.value) {
          const params = {
            token: this.commonService.getUserData('token'),
            clinic_id,
            status: meta_value
          };
          this.userClinicsService.online(params).subscribe(
            (response: any) => {
              if (response.status) {
                this.online_status = meta_value;
                this.localUserData.settings.online_status = meta_value;
                for (let i = 0; i < this.localUserData.clinics.length; i++) {
                  if (meta_value === 'Online' && i === parseInt(index)) {
                    this.localUserData.clinics[i].online = 'Yes';
                  } else {
                    this.localUserData.clinics[i].online = 'No';
                  }
                }
                this.commonService.setUserData(this.localUserData, this.storage_type);
                this.apiService.userData.next(this.localUserData);
                this.alertService.show_alert(responseTitle);
              }
            }
          );
      } else {
        window.location.reload();
      }
    });
  }
}
