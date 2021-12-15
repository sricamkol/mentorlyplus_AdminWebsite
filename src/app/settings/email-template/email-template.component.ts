import { Component, OnInit, ViewChild } from '@angular/core';
import { FormGroup, FormBuilder, Validators, NgForm } from '@angular/forms';
import { Router } from '@angular/router';
import { Title } from '@angular/platform-browser';
import { AngularEditorConfig } from '@kolkov/angular-editor';

import { EmailtemplateService } from '../../services/emailtemplate.service';
import { CommonService } from '../../services/common.service';
import { ModalService } from '../../services/modal.service';
import { AlertService } from '../../services/alert.service';

@Component({
  selector: 'app-email-template',
  templateUrl: './email-template.component.html',
  styleUrls: ['./email-template.component.css']
})
export class EmailTemplateComponent implements OnInit {
  @ViewChild('myform', { static: false }) myForm: NgForm;
  editorConfig: AngularEditorConfig = {
    editable: true,
    spellcheck: true,
    height: '250px',
    toolbarHiddenButtons: [
      [
        'insertImage',
        'insertVideo',
      ]
    ]
  };
  addFormTemp: FormGroup;
  updateForm: FormGroup;
  addFormAction: boolean = false;
  updateFormAction: boolean = false;
  templateData = [];
  updateDetail = {
    "template_id": "",
    "template_code": "",
    "subject": "",
    "body": "",
    "status": ""
  }

  constructor(
    private emailtemplateService: EmailtemplateService,
    private formBuilder: FormBuilder,
    private commonService: CommonService,
    private modalService: ModalService,
    private alertService: AlertService,
    private router: Router,
    private title: Title
  ) {
    this.title.setTitle('Email Template');
  }

  ngOnInit() {
    this.getTemplateData();
    this.addFormTemp = this.formBuilder.group({
      e_temp_name: ['', [
        Validators.required,
        Validators.minLength(2),
        Validators.maxLength(200)
      ]],
      e_temp_subject: ['', [
        Validators.required,
        Validators.minLength(2),
        Validators.maxLength(200)
      ]],
      e_temp_body: ['', [
        Validators.required
      ]],
      e_temp_status: ['Active', [
        Validators.required
      ]]

    });

    this.updateForm = this.formBuilder.group({
      e_temp_name_update: ['', [
        Validators.required,
        Validators.minLength(2),
        Validators.maxLength(200)
      ]],
      e_temp_subject_update: ['', [
        Validators.required,
        Validators.minLength(2),
        Validators.maxLength(200)
      ]],
      e_temp_body_update: ['', [
        Validators.required
      ]],
      e_temp_status_update: [[
        Validators.required
      ]]
    })

  }

  openForm() {
    this.addFormTemp.reset();
    this.addFormTemp.patchValue({
      e_temp_status: "Active"
    });
    this.modalService.open_modal('#createEmailTemplate');
  }

  getTemplateData() {
    this.emailtemplateService.emailtemplates_get().subscribe(
      (response: any) => {
        if (response.status) {
          this.templateData = response.data;
        }
      }
    )
  }

  onSubmitAddForm() {
    if (this.addFormTemp.valid) {
      let postData = new FormData();
      postData.append('token', this.commonService.getUserData('token'));
      postData.append('template_code', this.addFormTemp.value.e_temp_name);
      postData.append('subject', this.addFormTemp.value.e_temp_subject);
      postData.append('body', this.addFormTemp.value.e_temp_body);
      postData.append('status', this.addFormTemp.value.e_temp_status);
      this.addFormAction = true;
      this.emailtemplateService.template_add(postData).subscribe(
        (response: any) => {
          if (response.status) {
            this.modalService.close_modal('#createEmailTemplate');
            this.alertService.show_alert(response.message);
            this.myForm.resetForm();
            this.getTemplateData();
          }
          this.addFormAction = false;
        },
        (error) => { this.addFormAction = false; },
        () => { this.addFormAction = false; }
      );
    }
  }

  onClickEditBtn(template_id) {
    this.updateDetail = this.templateData.filter(x => x.template_id == template_id)[0];
    this.updateForm.patchValue({
      'e_temp_name_update': this.updateDetail.template_code,
      'e_temp_subject_update': this.updateDetail.subject,
      'e_temp_body_update': this.updateDetail.body,
      'e_temp_status_update': this.updateDetail.status

    });
    this.modalService.open_modal('#updateEmailTemplate');
  }

  onSubmitUpdateForm() {
    if (this.updateForm.valid) {
      let postData = {
        'token': this.commonService.getUserData('token'),
        'template_id': this.updateDetail.template_id,
        'template_code': this.updateForm.value.e_temp_name_update,
        'subject': this.updateForm.value.e_temp_subject_update,
        'body': this.updateForm.value.e_temp_body_update,
        'status': this.updateForm.value.e_temp_status_update,
      }
      this.updateFormAction = true;
      this.emailtemplateService.template_update(postData).subscribe(
        (response: any) => {
          if (response.status) {
            this.modalService.close_modal('#updateEmailTemplate');
            this.alertService.show_alert(response.message);
            this.getTemplateData();
          }
          this.updateFormAction = false;
        },
        (error) => { this.updateFormAction = false; },
        () => { this.updateFormAction = false; }
      );
    }
  }

}
