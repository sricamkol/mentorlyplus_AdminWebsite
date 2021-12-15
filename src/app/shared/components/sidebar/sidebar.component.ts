import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { Observable } from 'rxjs';
import Swal from 'sweetalert2';

import { ApiService } from '../../../services/api.service';
import { CommonService } from '../../../services/common.service';

@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.css'],
  encapsulation: ViewEncapsulation.None
})
export class SidebarComponent implements OnInit {
  isloggedInObservable$: Observable<boolean>;
  userType = '';
  created_by = 0;
  token = '';

  constructor(
    private apiService: ApiService,
    private commonService: CommonService
  ) {
    this.isloggedInObservable$ = this.commonService.isloggedInObservable;
    this.apiService.currentUserData.subscribe(
      (userData: any) => {
        this.userType = (userData.group_name) ? userData.group_name : this.commonService.getUserData('group_name');
        this.created_by = (userData.created_by) ? userData.created_by : this.commonService.getUserData('created_by');
      }
    );
  }

  ngOnInit() {}

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
    this.apiService.logout();
  }
}
