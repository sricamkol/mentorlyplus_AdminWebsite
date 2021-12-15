import { Component, OnInit, ViewEncapsulation } from "@angular/core";
import { Title } from "@angular/platform-browser";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { Router, ActivatedRoute } from '@angular/router';
import { AngularFireMessaging } from "@angular/fire/messaging";
import { DeviceDetectorService } from "ngx-device-detector";

import { ApiService } from "./../services/api.service";
import { CommonService } from "./../services/common.service";
import { environment } from "src/environments/environment";

@Component({
  selector: "app-login",
  templateUrl: "./login.component.html",
  styleUrls: ["./login.component.css"],
  encapsulation: ViewEncapsulation.None,
})
export class LoginComponent implements OnInit {
  isloggedIn = false;

  passwordType = "password";

  loginForm: FormGroup;
  loginFormLoader = false;
  emailRegex = this.commonService.emailRegex;
  errorMsg = "";

  firebase_token = '';
  deviceInfo = {
    browser: "",
    browser_version: "",
    device: "",
    os: "",
    os_version: "",
    userAgent: ""
  };

  returnUrl = '';

  production = environment.production;

  constructor(
    private title: Title,
    private fb: FormBuilder,
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private angularFireMessaging: AngularFireMessaging,
    private deviceDetectorService: DeviceDetectorService,
    private apiService: ApiService,
    private commonService: CommonService
  ) {
    this.title.setTitle("Login");
    this.activatedRoute.queryParamMap.subscribe(params => {
      this.returnUrl = params.get('returnUrl');
    });
    console.log('this.returnUrl', this.returnUrl);
    if (this.commonService.isLoggedIn()) {
      this.commonService.userDefaultRoute();
    } else if(environment.production) {
      //window.location.href = environment.site_url + (this.returnUrl ? '/login?returnUrl=admin'+this.returnUrl : '');
      if(this.returnUrl) {
        this.returnUrl = environment.admin_url + (this.returnUrl ? '/'+this.returnUrl : '');
        console.log('ru', this.returnUrl);
        window.location.href = environment.site_url + (this.returnUrl ? '/login?returnUrl='+encodeURIComponent(this.returnUrl) : '');
      } else {
        window.location.href = environment.site_url;
      }
    }
  }

  ngOnInit() {
    this.deviceInfo = this.deviceDetectorService.getDeviceInfo();
    this.angularFireMessaging.requestToken.subscribe(
      (token) => {
        this.firebase_token = token;
      }
    );
    this.loginForm = this.fb.group({
      email: ["", [
        Validators.required,
        Validators.email,
        Validators.pattern(this.emailRegex),
      ]],
      password: ["", Validators.required],
      remember_me: [""]
    });
  }

  onSubmitLoginForm() {
    if (this.loginForm.valid) {
      this.errorMsg = "";
      this.loginFormLoader = true;

      let postData = new FormData();
      postData.append('email', this.loginForm.value.email);
      postData.append('password', this.loginForm.value.password);
      postData.append('remember_me', this.loginForm.value.remember_me);
      postData.append('user_type', 'Panel');
      postData.append("deviceInfo[token]", this.firebase_token);
      postData.append("deviceInfo[systemName]", 'Website');
      postData.append("deviceInfo[deviceUniqueID]", this.firebase_token);
      postData.append("deviceInfo[deviceId]", this.deviceInfo.browser);
      postData.append("deviceInfo[deviceDesignName]", this.deviceInfo.browser);
      postData.append("deviceInfo[brandName]", this.deviceInfo.browser);
      postData.append("deviceInfo[deviceName]", this.deviceInfo.browser);
      postData.append("deviceInfo[manufacturer]", this.deviceInfo.os);
      postData.append("deviceInfo[systemVersion]", this.deviceInfo.browser_version);
      postData.append("deviceInfo[systemApiLevel]", this.deviceInfo.browser_version);
      postData.append("deviceInfo[appVersion]", this.deviceInfo.browser_version);
      postData.append("deviceInfo[deviceModel]", this.deviceInfo.browser);
      postData.append("deviceInfo[uiMode]", this.deviceInfo.os_version);
      postData.append("deviceInfo[Fingerprint]", this.deviceInfo.userAgent);
      postData.append("deviceInfo[Serial]", this.deviceInfo.browser_version);
      this.apiService.login(postData, this.loginForm.value.remember_me).subscribe(
        (response: any) => {
          this.loginFormLoader = false;
          if (response.status === false) {
            this.errorMsg = response.message;
          } else if(this.returnUrl) {
            this.router.navigateByUrl(this.returnUrl);
          }
        },
        (error) => { this.loginFormLoader = false; }
      );
    }
  }

  showHidePassword(passwordType: string) {
    if (passwordType == "password") {
      this.passwordType = "text";
    } else {
      this.passwordType = "password";
    }
  }

  /*
    console.log(this.deviceInfo);
    {
        "userAgent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/89.0.4389.90 Safari/537.36",
        "os": "Windows",
        "browser": "Chrome",
        "device": "Unknown",
        "os_version": "windows-10",
        "browser_version": "89.0.4389.90"
    }
  */
}
