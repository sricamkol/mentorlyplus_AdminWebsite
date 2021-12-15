import { Component, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { FormGroup, FormBuilder, Validators, NgForm } from '@angular/forms';

import { ApiService } from '../../services/api.service';
import { CommonService } from '../../services/common.service';
import { WebsettingsService } from '../../services/websettings.service';
import { ModalService } from '../../services/modal.service';
import { AlertService } from '../../services/alert.service';

@Component({
  selector: 'app-web-setting',
  templateUrl: './web-setting.component.html',
  styleUrls: ['./web-setting.component.css'],
  encapsulation: ViewEncapsulation.None
})
export class WebSettingComponent implements OnInit {
  userType = '';

  @ViewChild('ngaddform', { static: false} ) ngaddform: NgForm;
  addForm: FormGroup;
  addFormAction = false;

  @ViewChild('ngupdateform', { static: false} ) ngupdateform: NgForm;
  updateForm: FormGroup;
  updateFormAction = false;

  index: number;
  setting_id = '';
  settings = [];

  constructor(
    private title: Title,
    private websettingsService: WebsettingsService,
    private formBuilder: FormBuilder,
    private apiService: ApiService,
    private commonService: CommonService,
    private modalService: ModalService,
    private alertService: AlertService,
  ) {
    this.title.setTitle('Web Settings');
    this.userType = this.commonService.getUserData('group_name');
    const allowedUserTypes = ['Super Admin'];
    if (!allowedUserTypes.includes(this.userType)) {
      this.commonService.userDefaultRoute();
    }
  }

  ngOnInit() {
    this.getWebSettings();

    this.addForm = this.formBuilder.group({
      name: ['', [
        Validators.required,
        Validators.maxLength(50),
      ]],
      value: ['', [
        Validators.required,
        Validators.maxLength(250),
      ]],
      description: ['', [
        Validators.maxLength(250)
      ]],
    });

    this.updateForm = this.formBuilder.group({
      name: ['', [
        Validators.required,
        Validators.maxLength(50),
      ]],
      value: ['', [
        Validators.required,
        Validators.maxLength(250),
      ]],
      description: ['', [
        Validators.maxLength(250)
      ]],
    })
  }

  getWebSettings() {
    this.websettingsService.get().subscribe(
      (response: any) => {
        if (response.status) {
          this.settings = response.data;
        }
      }
    )
  }

  openAddForm() {
    this.ngaddform.resetForm();
    this.modalService.open_modal('#addFormModal');
  }

  onSubmitAddForm() {
    if (this.addForm.valid) {
      let postData = new FormData();
      postData.append('token', this.commonService.getUserData('token'));
      postData.append('name', this.addForm.value.name);
      postData.append('description', this.addForm.value.description);
      postData.append('value', this.addForm.value.value);
      this.addFormAction = true;
      this.websettingsService.create(postData)
        .subscribe((response: any) => {
          if (response.status) {
            this.modalService.close_modal('#addFormModal');
            this.alertService.show_alert(response.message);
            this.getWebSettings();
          }
          this.addFormAction = false;
        },
        (error) => { this.addFormAction = false; },
      );
    }
  }

  openUpdateForm(id:string, i:number) {
    this.index = i;
    this.setting_id = id;
    this.updateForm.patchValue({'name': this.settings[i].name});
    this.updateForm.patchValue({'value': this.settings[i].value });
    this.updateForm.patchValue({'description': this.settings[i].description});
    this.modalService.open_modal('#updateFormModal');
  }

  onSubmitupdateForm() {
    if (this.updateForm.valid) {
      let putData = {
        token: this.commonService.getUserData('token'),
        setting_id: this.setting_id,
        name: this.updateForm.value.name,
        value: this.updateForm.value.value,
        description: this.updateForm.value.description
      };
      this.updateFormAction = true;
      this.websettingsService.update(putData).subscribe(
        (response: any) => {
          if (response.status) {
            this.settings[this.index]['name'] = this.updateForm.value.name;
            this.settings[this.index]['value'] = this.updateForm.value.value;
            this.settings[this.index]['description'] = this.updateForm.value.description;
            this.setting_id = '';
            this.index = null;

            this.modalService.close_modal('#updateFormModal');
            this.alertService.show_alert(response.message);
          }
          this.updateFormAction = false;
        },
        (error) => { this.updateFormAction = false; }
      );
    }
  }
}






