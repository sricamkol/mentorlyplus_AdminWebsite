import { Component, OnInit, ViewEncapsulation, ViewChild, ElementRef } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { debounceTime, map } from "rxjs/operators";
import { fromEvent } from 'rxjs';

import { CommonService } from '../services/common.service';
import { UsersService } from '../services/users.service';

import { iUsers } from "../services/interface/i-users";

@Component({
  selector: 'app-user',
  templateUrl: './users.component.html',
  styleUrls: ['./users.component.css'],
  encapsulation: ViewEncapsulation.None
})
export class UsersComponent implements OnInit {
  userType = '';

  @ViewChild('searchTerm', { static: false }) searchTerm: ElementRef;

  currentPage = 1;
  itemsPerPage = 8;
  totalItems: number;
  search = '';

  dataLoader = false;
  users: iUsers[];

  constructor(
    private title: Title,
    private commonService: CommonService,
    private usersService: UsersService,
  ) {
    this.title.setTitle('Patients');
    this.userType = this.commonService.getUserData('group_name');
    const allowedUserTypes = ['Super Admin', 'Clinic', 'Doctor'];
    if (!allowedUserTypes.includes(this.userType)) {
      this.commonService.userDefaultRoute();
    }
    this.getTotalUsers();
  }

  ngAfterViewInit(): void {
    fromEvent(this.searchTerm.nativeElement, 'keyup').pipe(
      map((event: any) => { return event.target.value; }), debounceTime(1000)
    ).subscribe((text: string) => {
      this.search = text;
      this.getTotalUsers();
    });
  }

  ngOnInit() { }

  getTotalUsers() {
    this.usersService.total({search: this.search }).subscribe(
      (response: any) => {
        this.totalItems = response.data;
        this.getUsers()
      }
    );
  }

  getUsers() {
    this.dataLoader = true;
    this.usersService.get({limit: this.itemsPerPage, page: this.currentPage, search: this.search, ob_key: "user_id", ob_value: "DESC"}).subscribe(
      (response: any) => {
        if (response.status) {
          this.users = response.data;
        }
        this.dataLoader = false;
      },
      (error) => { this.dataLoader = false; }
    )
  }

  pageChanged(p: number) {
    this.currentPage = p;
    this.getUsers();
  }

  clearSearch() {
    this.searchTerm.nativeElement.value = '';
    this.search = '';
    this.getTotalUsers();
  }

}
