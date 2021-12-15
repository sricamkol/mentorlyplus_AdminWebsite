import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { CommonService } from './common.service';

@Injectable({
  providedIn: 'root'
})
export class SpecializationService {
  apiBaseUrl = '';

  constructor(
    private httpClient: HttpClient,
    private commonService: CommonService
  ) {
    this.apiBaseUrl = environment.api_url;
  }

  total(params: object = {}) {
    let apiURL = this.apiBaseUrl + '/specializations/total?token=' + this.commonService.getUserData('token');
    apiURL += this.commonService.queryParams(params);
    return this.httpClient.get(apiURL);
  }

  get(id='', params: object = {}) {
    let apiURL = this.apiBaseUrl + '/specializations/'+id+'?token=' + this.commonService.getUserData('token');
    apiURL += this.commonService.queryParams(params);
    return this.httpClient.get(apiURL);
  }

  select2(formData = {}) {
    let apiURL = this.apiBaseUrl + '/specializations/select2?token=' + this.commonService.getUserData('token');
    apiURL += this.commonService.queryParams(formData);
    return this.httpClient.get(apiURL, formData);
  }

  post(postData: FormData, id='') {
    let apiURL = this.apiBaseUrl + '/specializations/'+id;
    return this.httpClient.post(apiURL, postData);
  }

  delete(id='') {
    let apiURL = this.apiBaseUrl + '/specializations/'+id+'?token=' + this.commonService.getUserData('token');
    return this.httpClient.delete(apiURL);
  }

  delete_image(id='') {
    let apiURL = this.apiBaseUrl + '/specializations/image/'+id+'?token=' + this.commonService.getUserData('token');
    return this.httpClient.delete(apiURL);
  }

  delete_icon(id='') {
    let apiURL = this.apiBaseUrl + '/specializations/icon/'+id+'?token=' + this.commonService.getUserData('token');
    return this.httpClient.delete(apiURL);
  }
}
