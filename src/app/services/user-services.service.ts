import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { CommonService } from './common.service';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class UserServicesService {
  apiBaseUrl = '';

  constructor(
    private httpClient: HttpClient,
    private commonService: CommonService
  ) {
    this.apiBaseUrl = environment.api_url;
  }

  get(formData = {}) {
    let apiURL = this.apiBaseUrl + '/user_services?token=' + this.commonService.getUserData('token');
    apiURL += this.commonService.queryParams(formData);
    return this.httpClient.get(apiURL, formData);
  }

  create(formData: FormData) {
    let apiURL = this.apiBaseUrl + '/user_services';
    return this.httpClient.post(apiURL, formData);
  }

  update(formData: object) {
    let apiURL = this.apiBaseUrl + '/user_services';
    return this.httpClient.put(apiURL, formData);
  }

  update_clinic_service(formData: object) {
    let apiURL = this.apiBaseUrl + '/user_services/clinic';
    return this.httpClient.put(apiURL, formData);
  }

  delete(formData = {}) {
    let apiURL = this.apiBaseUrl + '/user_services?token=' + this.commonService.getUserData('token');
    apiURL += this.commonService.queryParams(formData);
    return this.httpClient.delete(apiURL, formData);
  }
}
