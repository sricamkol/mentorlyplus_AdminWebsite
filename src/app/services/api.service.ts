import { BehaviorSubject } from 'rxjs';
import { CommonService } from './common.service';
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { environment } from '../../environments/environment';
import { map } from 'rxjs/operators';

@Injectable()
export class ApiService {
  apiBaseUrl = '';
  userData = new BehaviorSubject({});
  currentUserData = this.userData.asObservable();

  constructor(
    private router: Router,
    private httpClient: HttpClient,
    private commonService: CommonService
  ) {
    this.apiBaseUrl = environment.api_url;
  }

  login(postData: FormData, remember_me = false) {
    let apiURL = this.apiBaseUrl + '/account/login';
    return this.httpClient.post(apiURL, postData).pipe(
      map(
        (response: any) => {
          if (response.status === true) {
            this.commonService.setLoggedInObservable(true);
            this.userData.next(response.data);
            this.commonService.setUserData(response.data, remember_me);
            this.commonService.userDefaultRoute();
          }
          return response;
        }
      )
    );
  }

  logout() {
    let userToken = this.commonService.getUserData('token');
    let userType = this.commonService.getUserData('group_name');
    if (userToken) {
      let apiURL = this.apiBaseUrl + '/account/logout?token=' + userToken;
      this.httpClient.get(apiURL).subscribe(
        (response) => {},
        (error) => {},
        () => {
          localStorage.removeItem('userData');
          sessionStorage.removeItem('userData');
          localStorage.removeItem('find_in');
          sessionStorage.removeItem('find_in');
          this.commonService.setLoggedInObservable(false);
          this.userData.next({});
          this.router.navigate(['/login']);
          //window.location.reload();
        }
      );
    }

    /* setTimeout(() => {
      window.location.href = 'https://medzigo.com';//environment.site_url;
    }, 5000); */
    /*
    if(userType == 'Super Admin') {
      this.router.navigate(['/login']);
    } else {
      window.location.href = environment.site_url;
    }*/
  }

}
