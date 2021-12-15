import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { CommonService } from './common.service';

@Injectable({
  providedIn: 'root'
})
export class DrugService {
  apiBaseUrl = '';

  constructor(
    private httpClient: HttpClient,
    private commonService: CommonService
  ) {
    this.apiBaseUrl = environment.api_url;
  }

  total(params: object = {}) {
    let apiURL = this.apiBaseUrl + '/drug/total?token=' + this.commonService.getUserData('token');
    apiURL += this.commonService.queryParams(params);
    return this.httpClient.get(apiURL);
  }

  get(params: object = {}) {
    let apiURL = this.apiBaseUrl + '/drug?token=' + this.commonService.getUserData('token');
    apiURL += this.commonService.queryParams(params);
    return this.httpClient.get(apiURL);
  }

  create(postData: FormData) {
    let apiURL = this.apiBaseUrl + '/drug';
    return this.httpClient.post(apiURL, postData);
  }

  update(id:string, putData: object) {
    let apiURL = this.apiBaseUrl + '/drug/' + id;
    return this.httpClient.put(apiURL, putData);
  }

  delete(id:string) {
    let apiURL = this.apiBaseUrl + '/drug/' + id + '?token=' + this.commonService.getUserData('token');
    return this.httpClient.delete(apiURL);
  }

  select2() {
    let apiURL = this.apiBaseUrl + '/drug/select2/?token=' + this.commonService.getUserData('token');
    return this.httpClient.get(apiURL);
  }

}
