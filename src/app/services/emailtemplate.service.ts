import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { CommonService } from './common.service';

@Injectable({
  providedIn: 'root'
})
export class EmailtemplateService {
  apiBaseUrl = '';

  constructor(
    private httpClient: HttpClient,
    private commonService: CommonService
  ) {
    this.apiBaseUrl = environment.api_url;
  }

  emailtemplates_get(params: object = {}) {
    let apiURL = this.apiBaseUrl + '/email_templates?token=' + this.commonService.getUserData('token');
    apiURL += this.commonService.queryParams(params);
    return this.httpClient.get(apiURL)
  }

  template_add(postData: FormData) {
    let apiURL = this.apiBaseUrl + '/email_templates';
    return this.httpClient.post(apiURL, postData);
  }

  template_update(postData: object = {}) {
    let apiURL = this.apiBaseUrl + '/email_templates';
    return this.httpClient.put(apiURL, postData);
  }
}
