import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { CommonService } from './common.service';

@Injectable({
  providedIn: 'root'
})
export class WebsettingsService {
  apiBaseUrl = '';

  constructor(
    private httpClient: HttpClient,
    private commonService: CommonService
  ) {
    this.apiBaseUrl = environment.api_url;
  }

  get(setting_id = '') {
    let apiURL = this.apiBaseUrl + '/settings?token=' + this.commonService.getUserData('token');
    apiURL += '&setting_id=' + setting_id;
    return this.httpClient.get(apiURL);
  }

  create(postData: FormData) {
    let apiURL = this.apiBaseUrl + '/settings';
    return this.httpClient.post(apiURL, postData);
  }

  update(putData: object) {
    let apiURL = this.apiBaseUrl + '/settings';
    return this.httpClient.put(apiURL, putData);
  }
}
