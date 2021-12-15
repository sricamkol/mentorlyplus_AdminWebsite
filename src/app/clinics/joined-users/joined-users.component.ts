import { Component, OnInit, ViewEncapsulation, ViewChild, ElementRef } from '@angular/core';
import { Title } from '@angular/platform-browser';
import Swal from 'sweetalert2';

import { CommonService } from 'src/app/services/common.service';
import { UserClinicsService } from 'src/app/services/user-clinics.service';
import { AlertService } from 'src/app/services/alert.service';

@Component({
  selector: 'app-joined-users',
  templateUrl: './joined-users.component.html',
  styleUrls: ['./joined-users.component.css']
})
export class JoinedUsersComponent implements OnInit {

  dataLoader = true;
  users = [];

  constructor(
    private title: Title,
    private commonService: CommonService,
    private userClinicsService: UserClinicsService,
    private alertService: AlertService
  ) {
    this.title.setTitle('All Users');
  }

  ngOnInit() {
    this.getJoinedUsers();
  }

  getJoinedUsers() {
    this.users = [];
    this.dataLoader = true;
    this.userClinicsService.joined_users().subscribe(
      (response: any) => {
        if (response.status) {
          this.users = response.data;
        }
        this.dataLoader = false;
      },
      (error) => { 
        this.dataLoader = false; 
      }
    )
  }

  doRequestAction(id:string, action:string) {
    Swal.fire({
      title: action+' User',
      text: 'Are you sure?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'OK',
      cancelButtonText: 'Cancel'
    }).then((result) => {
      if (result.value) {
        let putData = {
          token: this.commonService.getUserData('token'),
          id: id,
          action: action
        }
        this.dataLoader = true;
        this.userClinicsService.join_action(putData).subscribe(
          (response:any) => {
            this.dataLoader = false;
            if(response.status) {
              this.alertService.showSnackBar(response.message);
              this.getJoinedUsers();
            }
          },
          (error:any) => {
            this.dataLoader = false;
          }
        );
      }
    });
  }

}
