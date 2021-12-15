import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { Title } from '@angular/platform-browser';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { PasswordValidation } from './../services/password-validation';
import { AccountService } from './../services/account.service';
import { CommonService } from './../services/common.service';

@Component({
  selector: 'app-reset-password',
  templateUrl: './reset-password.component.html',
  styleUrls: ['./reset-password.component.css']
})
export class ResetPasswordComponent implements OnInit {
  resetPasswordForm:FormGroup;
  message:string = '';
  emailRegex = this.commonService.emailRegex;
  errorMsg:string = "";
  code:string='';
  showResetPasswordFormLoader=false;
  passwordChanged=false;
  constructor(
    private title: Title,
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private formBuilder: FormBuilder,
    private commonService: CommonService,
    private accountService: AccountService,

  ) {
    this.title.setTitle('Reset Password');
  }

  ngOnInit() {
    if (this.commonService.isLoggedIn()) {
      this.commonService.userDefaultRoute();
    } else {
      this.activatedRoute.params.subscribe(routeParams => {
		this.code = routeParams.code;
		if(this.code) {
          let postData = new FormData();
          postData.append('code', this.code);
          this.accountService.validate_reset_passcode_post(postData).subscribe(
            (response:any) => {
              if(!response.status) {
				this.router.navigate(['/login']);
              } else {
				this.message = response.message;
			  }
            }
          );
        } else {
			this.router.navigate(['/login']);
        }
      });
    }
    this.resetPasswordForm = this.formBuilder.group({
      password: ['', [
          Validators.required,
          Validators.minLength(8),
          Validators.maxLength(12)
        ]
      ],
      confirm_password: ['', [
          Validators.required
        ]
      ],
      otp:['',[
        Validators.required
      ]]
    }, {
      validator: PasswordValidation.MatchPassword
    });
  }

  onSubmit() {
    if (this.resetPasswordForm.valid) {
      this.errorMsg = '';
      this.showResetPasswordFormLoader = true;
      let postData = new FormData();
      postData.append('code', this.code);
      postData.append('otp', this.resetPasswordForm.value.otp);
      postData.append('password', this.resetPasswordForm.value.password);
      postData.append('confirm_password', this.resetPasswordForm.value.confirm_password);
      this.accountService.reset_password_post(postData).subscribe(
        (response :any) => {
          if(response.status === true) {
            this.passwordChanged = true;
          } else {
            this.errorMsg = response.message;
            this.showResetPasswordFormLoader = false;
          }
        },
        (error) => { this.showResetPasswordFormLoader = false; }
      );
    }
  }

}
