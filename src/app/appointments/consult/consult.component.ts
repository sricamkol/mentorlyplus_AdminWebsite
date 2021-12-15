import { Component, ElementRef, HostListener, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { FormGroup, FormBuilder, FormControl, FormArray, Validators, NgForm } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import Swal from 'sweetalert2';

import { Select2OptionData } from 'ng-Select2';
import { Options } from 'select2';

import { AgoraClient, ClientEvent, NgxAgoraService, Stream, StreamEvent } from 'ngx-agora';
import * as firebase from 'firebase';

import { iHealthRecord } from 'src/app/services/interface/i-health-record';
import { Observable } from 'rxjs';

import { ApiService } from '../../services/api.service';
import { CommonService } from '../../services/common.service';
import { AppointmentService } from '../../services/appointment.service';
import { AppointmentPrescriptionService } from '../../services/appointment-prescription.service';
import { HealthRecordService } from '../../services/health-record.service';
import { DrugService } from '../../services/drug.service';
import { NotificationService } from '../../services/notification.service';
import { AlertService } from '../../services/alert.service';
import { ModalService } from '../../services/modal.service';
import { DialogService } from 'src/app/services/dialog.service';

import { MomentDateAdapter, MAT_MOMENT_DATE_ADAPTER_OPTIONS } from '@angular/material-moment-adapter';
import { DateAdapter, MAT_DATE_FORMATS, MAT_DATE_LOCALE } from '@angular/material/core';
import * as _moment from 'moment';
const moment = _moment;
export const MY_FORMATS = {
  parse: {
    dateInput: 'LL',
  },
  display: {
    dateInput: 'DD/MM/YYYY',
    monthYearLabel: 'MMM YYYY',
    dateA11yLabel: 'LL',
    monthYearA11yLabel: 'MMMM YYYY',
  },
};

@Component({
  selector: 'app-consult',
  templateUrl: './consult.component.html',
  styleUrls: ['./consult.component.css'],
  encapsulation: ViewEncapsulation.None,
  providers: [
    {
      provide: DateAdapter,
      useClass: MomentDateAdapter,
      deps: [MAT_DATE_LOCALE, MAT_MOMENT_DATE_ADAPTER_OPTIONS]
    },
    { provide: MAT_DATE_FORMATS, useValue: MY_FORMATS }
  ]
})
export class ConsultComponent implements OnInit {

  isMediaPermissionAllowed:boolean = null;
  isLoadingResults = true;
  appointment_id = '';
  appointmentDetail: any = {
    show_mark_completed: false
  };
  appointment_status = '';
  attachments = [];
  userID='';
  userType = '';
  index: number;
  prescription_id = '';
  fb_key = '';
  editButton = false;

  @ViewChild('ngprescriptionform', { static: false }) ngprescriptionform: NgForm;
  prescriptionForm: FormGroup;
  prescriptionFormLoader = false;
  drugsSelect2Options: Options = {width: '100%', multiple: false, tags: false};
  drugsSelect2Data: Select2OptionData[];
  dataLoader = false;

  @ViewChild('scrollMe', { static: false }) private myScrollContainer: ElementRef;
  chatForm: FormGroup;
  chatFormLoader = false;

  messages = [];

  prescriptions = {
    'Medicine': [],
    'Lab': [],
    'Imaging': [],
    'Recommend': []
  };
  appointmentPrescriptionsRef = firebase.database().ref('appointmentPrescriptions/');

  localCallId = 'agora_local';
  remoteCalls: string[] = [];
  client: AgoraClient;
  localStream: Stream;
  uid: number;
  agoraToken = '';
  channelName = '';
  fullScreen = false;
  mediaErrorMsg = 'Either you did not allowed the camera and microphone permission or it was used by other applications, Please close other application and try again';

  /* @HostListener('document:keydown.escape', ['$event']) onKeydownHandler(event: KeyboardEvent) {
    this.fullScreenToggle(false);
    //this.fullScreen = false;
  } */

  @HostListener('fullscreenchange', ['$event'])
  @HostListener('webkitfullscreenchange', ['$event'])
  @HostListener('mozfullscreenchange', ['$event'])
  @HostListener('MSFullscreenChange', ['$event'])
  screenChange(event) {
    this.fullScreen = !this.fullScreen;
  }

  shareHealthRecordAction = '';
  healthRecordsDataLoader = false;
  healthRecords: iHealthRecord[];
  maxDateDob = this.commonService.maxDobDate;
  @ViewChild('ngaddhealthrecordform', { static: false }) ngaddhealthrecordform: NgForm;
  @ViewChild('ngaddhealthrecordfileinput', { static: false }) ngaddhealthrecordfileinput: ElementRef;
  addHealthRecordForm: FormGroup;
  addHealthRecordFormLoader = false;
  addHealthRecordFileInput: File;
  record_type = '';

  constructor(
    private ngxAgoraService: NgxAgoraService,
    private title: Title,
    private formBuilder: FormBuilder,
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private apiService: ApiService,
    private commonService: CommonService,
    private appointmentService: AppointmentService,
    private appointmentPrescriptionService: AppointmentPrescriptionService,
    private healthRecordService: HealthRecordService,
    private drugService: DrugService,
    private modalService: ModalService,
    private alertService: AlertService,
    private dialogService: DialogService,
    private notificationService: NotificationService
  ) {
    this.title.setTitle('Consultation');
    this.apiService.currentUserData.subscribe(
      (userData: any) => {
        this.userType = (userData.group_name) ? userData.group_name : this.commonService.getUserData('group_name');
        const allowedUserTypes = ['Patient', 'Doctor'];
        if (!allowedUserTypes.includes(this.userType)) {
          this.commonService.userDefaultRoute();
        }
      }
    );

    //this.uid = Math.floor(Math.random() * 100);

    this.activatedRoute.params.subscribe(routeParams => {
      this.appointment_id = routeParams.appointment_id;
      this.appointment_detail();
      if (this.userType == 'Doctor') {
        this.getDrugList();
      }
    });

    this.prescriptionForm = this.formBuilder.group({
      prescription_type: ['Medicine', [Validators.required]],
      item_name: ['', [Validators.required]],
      dosage: ['', [Validators.required]],
      frequency: ['', [Validators.required]],
      intake: ['After Food', [Validators.required]],
      duration: ['', [Validators.required]],
      duration_type: ['Day', [Validators.required]],
      prescribe_note: [''],
    });

    this.chatForm = this.formBuilder.group({
      'message': ['']
    });

    this.addHealthRecordForm = this.formBuilder.group({
      records: new FormArray([]),
      name: ['', [
        Validators.required,
        Validators.minLength(2),
        Validators.maxLength(200)
      ]],
      doctor: [''],
      description: [''],
      file: ['', [
        Validators.required
      ]],
      record_date: ['', [
        Validators.required
      ]],
      record_type: ['', [
        Validators.required
      ]]
    });
  }

  get recordsFormArray() {
    return this.addHealthRecordForm.controls.records as FormArray;
  }

  manageContentLoader(loader:boolean) {
    console.log(loader);
    this.isLoadingResults = loader;
  }

  ngOnInit() {
    /* navigator.mediaDevices.getUserMedia({ audio: true, video: true })
    .then(function(stream) {
      console.log('stream', stream);
    })
    .catch(function(err) {
      console.log('err', err);
    }); */
    console.log('this.ngxAgoraService.audioDevices', this.ngxAgoraService.videoDevices);
    console.log('this.ngxAgoraService.audioDevices', this.ngxAgoraService.audioDevices);
    console.log('this.localStream', this.localStream);
    this.leaveCall();
    this.prescriptionForm.get('prescription_type').valueChanges.subscribe(value => {
      if (['Lab', 'Imaging', 'Recommend'].includes(value)) {
        this.prescriptionForm.get('item_name').clearValidators();
        this.prescriptionForm.get('dosage').clearValidators();
        this.prescriptionForm.get('frequency').clearValidators();
        this.prescriptionForm.get('intake').clearValidators();
        this.prescriptionForm.get('duration').clearValidators();
        this.prescriptionForm.get('duration_type').clearValidators();
        this.prescriptionForm.get('prescribe_note').setValidators([Validators.required, Validators.maxLength(1000)]);
        this.prescriptionForm.patchValue({
          'item_name': '', 'dosage': '', 'frequency': '', 'intake': '', 'duration': '', 'duration_type': ''
        });
      } else if (value == 'Medicine') {
        this.prescriptionForm.get('item_name').setValidators([Validators.required]);
        this.prescriptionForm.get('dosage').setValidators([Validators.required]);
        this.prescriptionForm.get('frequency').setValidators([Validators.required]);
        this.prescriptionForm.get('intake').setValidators([Validators.required]);
        this.prescriptionForm.get('duration').setValidators([Validators.required]);
        this.prescriptionForm.get('duration_type').setValidators([Validators.required]);
        this.prescriptionForm.get('prescribe_note').clearValidators();
        this.prescriptionForm.patchValue({
          'intake': 'After Food', 'duration_type': 'Day'
        });
      }
      this.prescriptionForm.get('item_name').updateValueAndValidity();
      this.prescriptionForm.get('dosage').updateValueAndValidity();
      this.prescriptionForm.get('frequency').updateValueAndValidity();
      this.prescriptionForm.get('intake').updateValueAndValidity();
      this.prescriptionForm.get('duration').updateValueAndValidity();
      this.prescriptionForm.get('duration_type').updateValueAndValidity();
      this.prescriptionForm.get('prescribe_note').updateValueAndValidity();
    });
  }

  canDeactivate(): Observable<boolean> | boolean {
    if(this.localStream != null || this.localStream != undefined) {
      return this.dialogService.confirm('You are in a meeting, Are you sure you want to disconnect and navigate to another page?');
    }
    return true;
  }

  ngOnDestroy() {
    this.leaveCall();
    
    if(this.userType == 'Patient') {
      this.doctorRef.update({ patientOnChat: false });
      this.patientRef.update({ patientOnChat: false });
    } else if(this.userType == 'Doctor') {
      this.doctorRef.update({ doctorOnChat: false });
      this.patientRef.update({ doctorOnChat: false });
    }
  }

  appointment_detail() {
    this.isLoadingResults = true;
    this.appointmentService.appointments({'appointment_id': this.appointment_id}).subscribe(
      (response: any) => {
        if (response.status) {
          this.appointmentDetail = response.data;
          this.appointment_status = this.appointmentDetail.appointment_status;
          //console.log('this.appointmentDetail', this.appointmentDetail);
          this.attachments = this.appointmentDetail.attachments;
          this.channelName = this.appointmentDetail.channelName;
          this.agoraToken = this.appointmentDetail.token;
          if(this.userType == 'Doctor') {
            this.userID = this.appointmentDetail.doctor_id;
          } else {
            this.userID = this.appointmentDetail.user_id;
          }
          this.initInfo();
          this.getAppointmentChats();
          this.getAppointmentPrescriptions();
          this.createGroup();
          this.getHealthRecords();
          this.isLoadingResults = false;
        } else {
          this.router.navigate(['/appointments']);
        }
      },
      (error) => {
        this.router.navigate(['/appointments']);
      }
    )
  }

  getHealthRecords() {
    this.addHealthRecordForm = this.formBuilder.group({
      records: new FormArray([]),
      name: ['', [
        Validators.required,
        Validators.minLength(2),
        Validators.maxLength(200)
      ]],
      doctor: [''],
      description: [''],
      file: ['', [
        Validators.required
      ]],
      record_date: ['', [
        Validators.required
      ]],
      record_type: ['', [
        Validators.required
      ]]
    });

    let params = {};
    if(this.userType != 'Patient') {
      params['patient_id'] = this.appointmentDetail.patient_id;
    }
    this.healthRecordService.get(params).subscribe(
      (response:any) => {
        if(response.status) {
          this.healthRecords = response.data;
          this.healthRecords.forEach(() => this.recordsFormArray.push(new FormControl(false)));
        }
      }
    );
  }

  doctorInfo:any;
  appInfo:any;
  patientInfo:any;
  doctorRef:any;
  patientRef:any;

  initInfo() {
    this.doctorInfo = {
      doctor_id: this.appointmentDetail.doctor_id,
      doctor_name: this.appointmentDetail.doctor_name,
      doctor_image: this.appointmentDetail.doctor_image_url,
      /* doctor_age: this.appointmentDetail.doctor_age_formatted,
      doctor_gender: this.appointmentDetail.doctor_gender, */
      doctor_specialization: this.appointmentDetail.doctor_specialization,
      doctor_education: this.appointmentDetail.doctor_education,
    };
    console.log('doctorInfo', this.doctorInfo);

    this.appInfo = {
      appointment_id: this.appointmentDetail.appointment_id,
      appDate: this.appointmentDetail.appointment_date,
      appFromTime: this.appointmentDetail.appointment_from_time,
      appToTime: this.appointmentDetail.appointment_to_time,
      appExpiry: this.appointmentDetail.appointment_date +' '+ this.appointmentDetail.appointment_to_time,
      
      patient_id: this.appointmentDetail.patient_id,
      user_id: this.appointmentDetail.user_id,
      doctor_id: this.appointmentDetail.doctor_id,

      aToken: this.appointmentDetail.token,
      aTokenExpiry: this.appointmentDetail.token_expiry_time,
      aId: this.appointmentDetail.vid,
      aCrt: this.appointmentDetail.vcrt,
      aChanel: this.appointmentDetail.channelName,
    };

    this.patientInfo = {
      patient_name: this.appointmentDetail.user_name,
      patient_image: this.appointmentDetail.user_image_url,
      patient_age: this.appointmentDetail.patient_age_formatted,
      patient_gender: this.appointmentDetail.patient_gender,
      patient_id: this.appointmentDetail.patient_id,
      user_id: this.appointmentDetail.user_id,
    };
    
    this.doctorRef = firebase.database().ref('group/' + this.appointmentDetail.doctor_id + '/' + this.appointmentDetail.user_id);
    this.patientRef = firebase.database().ref('group/' + this.appointmentDetail.user_id + '/' + this.appointmentDetail.doctor_id); 
  }

  createGroup() {
    this.doctorRef.once('value').then((data)=> {
      if(data.exists()) {
        if(this.userType == 'Patient') {
          this.doctorRef.update({
            patientUnReadCount: 0,
            patientOnChat: true,
            patientInfo: this.patientInfo,
            appInfo: this.appInfo,
            updatedDate: new Date().toISOString()
          });
        } else if(this.userType == 'Doctor') {
          this.doctorRef.update({
            doctorUnReadCount: 0,
            doctorOnChat: true,
            patientInfo: this.patientInfo,
            appInfo: this.appInfo,
            updatedDate: new Date().toISOString()
          });
        }
      } else {
        this.doctorRef.set({
          patientInfo: this.patientInfo,
          appInfo: this.appInfo,
          patientUnReadCount: 0,
          patientOnChat: (this.userType == 'Patient' ? true : false),
          doctorUnReadCount: 0,
          doctorOnChat: (this.userType == 'Doctor' ? true : false),
          message: '',
          createdDate: new Date().toISOString()
        });
      }
    });

    this.patientRef.once('value').then((data)=> {
      if(data.exists()) {
        if(this.userType == 'Patient') {
          this.patientRef.update({
            patientUnReadCount: 0,
            patientOnChat: true,
            doctorInfo: this.doctorInfo,
            appInfo: this.appInfo,
            updatedDate: new Date().toISOString()
          });
        } else if(this.userType == 'Doctor') {
          this.patientRef.update({
            doctorUnReadCount: 0,
            doctorOnChat: true,
            doctorInfo: this.doctorInfo,
            appInfo: this.appInfo,
            updatedDate: new Date().toISOString()
          });
        }
      } else {
        this.patientRef.set({
          doctorInfo: this.doctorInfo,
          appInfo: this.appInfo,
          patientUnReadCount: 0,
          patientOnChat: (this.userType == 'Patient' ? true : false),
          doctorUnReadCount: 0,
          doctorOnChat: (this.userType == 'Doctor' ? true : false),
          message: '',
          createdDate: new Date().toISOString()
        });
      }
    });
  }

  getAppointmentChats() {
    firebase.database().ref('messages/' + this.appointmentDetail.doctor_id + '/' + this.appointmentDetail.user_id + '/').on('value', resp => {
      this.messages = [];
      this.messages = this.commonService.fbSnapshotToArray(resp);
      console.log('this.messages', this.messages);
      setTimeout(() => this.scrollToBottom(), 200);
    });
  }

  getAppointmentPrescriptions() {
    this.appointmentPrescriptionsRef.orderByChild('appointment_id').equalTo(this.appointment_id).on('value', resp => {
      let prescriptions = this.commonService.fbSnapshotToArray(resp);
      this.prescriptions = {
        Medicine: [],
        Lab: [],
        Imaging: [],
        Recommend: []
      };
      //console.log('prescriptions', prescriptions);
      prescriptions.map(x => {
        if(x.prescription_type == 'Medicine') this.prescriptions.Medicine.push(x);
        if(x.prescription_type == 'Lab') this.prescriptions.Lab.push(x);
        if(x.prescription_type == 'Imaging') this.prescriptions.Imaging.push(x);
        if(x.prescription_type == 'Recommend') this.prescriptions.Recommend.push(x);
      });

      //console.log('this.prescriptions', this.prescriptions);
    });
  }

  getDrugList() {
    this.drugService.select2().subscribe(
      (response: any) => {
        if (response.status) {
          this.drugsSelect2Data = response.data;
        }
      });
  }

  onSelectPrescriptionItem(value) {
    //console.log('onSelectPrescriptionItem', value);
    this.prescriptionForm.patchValue({
      item_name: value,
    });
  }

  onSubmitPrescriptionForm() {
    //console.log('this.prescriptionForm.value', this.prescriptionForm.value);
    if (this.prescriptionForm.valid) {
      let postData = new FormData();
      postData.append("token", this.commonService.getUserData("token"));
      postData.append("appointment_id", this.appointment_id);
      postData.append("prescription_type", this.prescriptionForm.value.prescription_type);
      postData.append("item_name", this.prescriptionForm.value.item_name);
      postData.append("dosage", this.prescriptionForm.value.dosage);
      postData.append("frequency", this.prescriptionForm.value.frequency);
      postData.append("intake", this.prescriptionForm.value.intake);
      postData.append("duration", this.prescriptionForm.value.duration);
      postData.append("duration_type", this.prescriptionForm.value.duration_type)
      postData.append("prescribe_note", this.prescriptionForm.value.prescribe_note);
      this.prescriptionFormLoader = true;
      this.appointmentPrescriptionService.create(postData).subscribe(
        (response: any) => {
          if (response.status) {
            this.prescriptionFormLoader = false;
            const fbPreparedPrescription = {
              "appointment_id": this.appointment_id,
              "prescription_id": response.data.prescription_id,
              "prescription_type": this.prescriptionForm.value.prescription_type,
              "item_name": this.prescriptionForm.value.item_name,
              "dosage": this.prescriptionForm.value.dosage,
              "frequency": this.prescriptionForm.value.frequency,
              "intake": this.prescriptionForm.value.intake,
              "duration": this.prescriptionForm.value.duration,
              "duration_type": this.prescriptionForm.value.duration_type,
              "prescribe_note": this.prescriptionForm.value.prescribe_note,
            }
            const newMessage = this.appointmentPrescriptionsRef.push();
            newMessage.set(fbPreparedPrescription).then((resp:any) => {});
            this.resetPrescriptionForm(this.prescriptionForm.value.prescription_type);
          }
        },
        (error) => { this.prescriptionFormLoader = false; },
        () => { this.prescriptionFormLoader = false; }
      );
    }
  }

  resetPrescriptionForm(prescription_type:string) {
    this.ngprescriptionform.resetForm();
    this.prescriptionForm.patchValue({
      prescription_type: prescription_type,
      item_name: '',
      intake: 'After Food',
      duration_type: 'Day',
    });
    this.editButton = false;
    this.prescription_id = '';
    this.index = null;
  }

  onEditPrescription(item:any, i:number) {
    this.prescription_id = item.prescription_id;
    this.index = i;
    this.fb_key = item.key;
    this.prescriptionForm.patchValue({
      prescription_type: item.prescription_type,
      item_name: item.item_name,
      intake: item.intake,
      duration_type: item.duration_type,
      prescribe_note: item.prescribe_note,
      duration: item.duration,
      frequency: item.frequency,
      dosage: item.dosage
    });
    this.editButton = true;
  }

  onSubmitPrescriptionUpdateForm() {
    if (this.prescriptionForm.valid) {
      let postData = {
        token: this.commonService.getUserData("token"),
        prescription_type: this.prescriptionForm.value.prescription_type,
        item_name: this.prescriptionForm.value.item_name,
        dosage: this.prescriptionForm.value.dosage,
        frequency: this.prescriptionForm.value.frequency,
        intake: this.prescriptionForm.value.intake,
        duration: this.prescriptionForm.value.duration,
        duration_type: this.prescriptionForm.value.duration_type,
        prescribe_note: this.prescriptionForm.value.prescribe_note
      };
      this.prescriptionFormLoader = true;
      this.appointmentPrescriptionService.update(this.prescription_id, postData).subscribe(
        (response: any) => {
          if (response.status) {
            delete postData["token"];
            firebase.database().ref('/appointmentPrescriptions/' + this.fb_key).update(postData);
          };
          this.resetPrescriptionForm(this.prescriptionForm.value.prescription_type);
          this.prescriptionFormLoader = false;
        },
        (error)=>{this.prescriptionFormLoader = false;},
        ()=>{this.prescriptionFormLoader = false;}
      )
    }
  }

  onDeletePrescription(item: any) {
    Swal.fire({
      title: 'Delete',
      text: 'Are you sure?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'OK',
      cancelButtonText: 'Cancel'
    }).then((result) => {
      if (result.value) {
        this.dataLoader = true;
        this.appointmentPrescriptionService.delete(item.prescription_id).subscribe(
          (response: any) => {
            if (response.status) {
              firebase.database().ref('/appointmentPrescriptions/' + item.key).remove();
            }
            this.dataLoader = false;
          },
          (error) => { this.dataLoader = false; },
          () => { this.dataLoader = false; }
        )
      }
    });
  }

  scrollToBottom(): void {
    try {
      this.myScrollContainer.nativeElement.scrollTop = this.myScrollContainer.nativeElement.scrollHeight;
    } catch (err) { }
  }

  onSendMessage() {
    let message = this.chatForm.value.message;
    if (message.length == 0) {
      return false;
    }
    this.chatFormLoader = true;
    let user_id = this.appointmentDetail.user_id;
    let user_name = this.appointmentDetail.user_name;
    let user_image = this.appointmentDetail.patient_image_url;
    if (this.userType != 'Patient') {
      user_id = this.appointmentDetail.doctor_id;
      user_name = this.appointmentDetail.doctor_name;
      user_image = this.appointmentDetail.doctor_image_url;
    }
    const chat_msg = {
      '_id' : Math.round(Math.random() * 1000000),
      'createdAt' : new Date().toISOString(),
      'doctor_id': this.appointmentDetail.doctor_id,
      'patient_id': this.appointmentDetail.user_id,
      'text': message,
      'user' : {
        '_id': user_id,
        'avatar': user_image,
        'name': user_name
      }
    };
    const msg = firebase.database().ref('messages/' + this.appointmentDetail.doctor_id + '/' + this.appointmentDetail.user_id + '/').push();
    msg.set(chat_msg).then((resp: any) => {
      //console.log('new message added message ref');
      this.scrollToBottom();
      this.chatForm.patchValue({ 'message': '' });
      this.chatFormLoader = false;
    });

    this.doctorRef.update({
      message: chat_msg.text,
      createdDate: chat_msg.createdAt
    });
    this.patientRef.update({
      message: chat_msg.text,
      createdDate: chat_msg.createdAt
    });

    if(this.userType == 'Doctor') {
      this.doctorRef.once('value').then(data => {
        let dataValue = data.val();
        if(!dataValue.patientOnChat) {
          this.patientRef.once('value').then(data => {
            let pData = data.val();
            let count = pData.patientUnReadCount + 1;
            this.patientRef.update({patientUnReadCount:count});
          });
          //send push notification api to patient
          let formData = new FormData();
          formData.append('send_to', this.appointmentDetail.user_id);
          formData.append('title', this.appointmentDetail.doctor_name + ' has sent you a message');
          formData.append('body', chat_msg.text);
          formData.append('route', 'Consult');
          formData.append('menu', 'Chat');
          formData.append('data', JSON.stringify({appInfo: this.appInfo, doctorInfo: this.doctorInfo}));
          this.notificationService.sendPushnotification(formData).subscribe()
        }
      });
    } else if(this.userType == 'Patient') {
      this.patientRef.once('value').then(data => {
        let dataValue = data.val();
        if(!dataValue.doctorOnChat) {
          this.doctorRef.once('value').then(data => {
            let dData = data.val();
            let count = dData.doctorUnReadCount + 1;
            this.doctorRef.update({doctorUnReadCount:count});
          });
          //send push notification api to doctor
          let formData = new FormData();
          formData.append('send_to', this.appointmentDetail.doctor_id);
          formData.append('title', this.appointmentDetail.user_name + ' has sent you a message');
          formData.append('body', chat_msg.text);
          formData.append('route', 'Consult');
          formData.append('menu', 'Chat');
          formData.append('data', JSON.stringify({appInfo: this.appInfo, patientInfo: this.patientInfo}));
          this.notificationService.sendPushnotification(formData).subscribe()
        }
      });
    }
  }

  fullScreenToggle(fullScreen:boolean) {
    if(fullScreen) {
      const docElmWithBrowsersFullScreenFunctions = document.getElementById("remote-containers") as HTMLElement & {
        mozRequestFullScreen(): Promise<void>;
        webkitRequestFullscreen(): Promise<void>;
        msRequestFullscreen(): Promise<void>;
      };
      if (docElmWithBrowsersFullScreenFunctions.requestFullscreen) {
        docElmWithBrowsersFullScreenFunctions.requestFullscreen();
      } else if (docElmWithBrowsersFullScreenFunctions.mozRequestFullScreen) { /* Firefox */
        docElmWithBrowsersFullScreenFunctions.mozRequestFullScreen();
      } else if (docElmWithBrowsersFullScreenFunctions.webkitRequestFullscreen) { /* Chrome, Safari and Opera */
        docElmWithBrowsersFullScreenFunctions.webkitRequestFullscreen();
      } else if (docElmWithBrowsersFullScreenFunctions.msRequestFullscreen) { /* IE/Edge */
        docElmWithBrowsersFullScreenFunctions.msRequestFullscreen();
      }
    } else {
      const docWithBrowsersExitFunctions = document as Document & {
        mozCancelFullScreen(): Promise<void>;
        webkitExitFullscreen(): Promise<void>;
        msExitFullscreen(): Promise<void>;
      };
      if (docWithBrowsersExitFunctions.exitFullscreen) {
        docWithBrowsersExitFunctions.exitFullscreen();
      } else if (docWithBrowsersExitFunctions.mozCancelFullScreen) { /* Firefox */
        docWithBrowsersExitFunctions.mozCancelFullScreen();
      } else if (docWithBrowsersExitFunctions.webkitExitFullscreen) { /* Chrome, Safari and Opera */
        docWithBrowsersExitFunctions.webkitExitFullscreen();
      } else if (docWithBrowsersExitFunctions.msExitFullscreen) { /* IE/Edge */
        docWithBrowsersExitFunctions.msExitFullscreen();
      }
    }
  }

  startCall(isVideoEnabled=true) {
    //console.log('this.client', this.client);
    if(this.client != undefined) {
      return false;
    }
    this.client = this.ngxAgoraService.createClient({ mode: 'rtc', codec: 'vp8' });
    //console.log('this.client', this.client);
    this.assignClientHandlers();

    this.localStream = this.ngxAgoraService.createStream({ streamID: this.userID, audio: true, video: isVideoEnabled, screen: false });
    this.assignLocalStreamHandlers();
    this.initLocalStream(() => this.join(uid => this.publish(), error => console.error(error)));
  }

  muteAudio() {
    console.log(this.localStream.isAudioOn());
    this.localStream.muteAudio();
    console.log(this.localStream.isAudioOn());
  }

  unmuteAudio() {
    console.log(this.localStream);
    this.localStream.unmuteAudio();
    console.log(this.localStream);
  }

  muteVideo() {
    console.log(this.localStream);
    this.localStream.muteVideo();
    console.log(this.localStream);
  }

  unmuteVideo() {
    console.log(this.localStream);
    this.localStream.unmuteVideo();
    console.log(this.localStream);
  }

  private assignLocalStreamHandlers(): void {
    this.localStream.on(StreamEvent.MediaAccessAllowed, () => {
      console.log('accessAllowed');
      this.isMediaPermissionAllowed = true;
    });

    // The user has denied access to the camera and mic.
    this.localStream.on(StreamEvent.MediaAccessDenied, () => {
      console.log('accessDenied');
      this.isMediaPermissionAllowed = false;
    });
  }

  private initLocalStream(onSuccess?: () => any): void {
    this.localStream.init(
      () => {
        this.isMediaPermissionAllowed = true;
        // The user has granted access to the camera and mic.
        this.localStream.play(this.localCallId);
        if (onSuccess) {
          onSuccess();
        }
      },
      (err:any) => {
        this.isMediaPermissionAllowed = false;
        console.error('getUserMedia failed', err);
        this.alertService.showValidationErrors(this.mediaErrorMsg);
      }
    );
  }

  remoteAudioStatus:boolean = null;
  remoteVideoStatus:boolean = null;
  private assignClientHandlers(): void {
    this.client.on(ClientEvent.LocalStreamPublished, evt => {
      console.log('Publish local stream successfully');
    });

    this.client.on(ClientEvent.Error, error => {
      //console.log('Got error msg:', error.reason);
      if (error.reason === 'DYNAMIC_KEY_TIMEOUT') {
        this.client.renewChannelKey(
          '',
          () => {
            console.log('Renewed the channel key successfully.')
          },
          renewError => console.error('Renew channel key failed: ', renewError)
        );
      }
    });

    this.client.on(ClientEvent.RemoteStreamAdded, evt => {
      const stream = evt.stream as Stream;
      console.log('Remote Stream Added');
      console.log('stream.isAudioOn()', stream.isAudioOn());
      console.log('stream.isVideoOn()', stream.isVideoOn());
      this.remoteAudioStatus = stream.isAudioOn();
      this.remoteVideoStatus = stream.isVideoOn();
      this.client.subscribe(stream, { audio: true, video: true },err => {console.log('Subscribe stream failed', err);});
    });

    this.client.on(ClientEvent.RemoteStreamSubscribed, evt => {
      const stream = evt.stream as Stream;
      const id = this.getRemoteId(stream);
      if (!this.remoteCalls.length) {
        this.remoteCalls.push(id);
        console.log('this.remoteCalls', this.remoteCalls);
        setTimeout(() => stream.play(id), 1000);
        let u = this.appointmentDetail.patient_name;
        if(this.userType == 'Patient') {
          u = this.appointmentDetail.doctor_name;
        }
        this.alertService.showSnackBar(u+' has connected to consultation');
      }
    });

    this.client.on(ClientEvent.RemoteAudioMuted, evt => {
      console.log('RemoteAudioMuted');
      this.remoteAudioStatus = false;
      let u = this.appointmentDetail.patient_name;
      if(this.userType == 'Patient') {
        u = this.appointmentDetail.doctor_name;
      }
      this.alertService.showSnackBar(u+' has muted his audio');
    });

    this.client.on(ClientEvent.RemoteAudioUnmuted, evt => {
      console.log('RemoteAudioUnmuted');
      this.remoteAudioStatus = true;
      let u = this.appointmentDetail.patient_name;
      if(this.userType == 'Patient') {
        u = this.appointmentDetail.doctor_name;
      }
      this.alertService.showSnackBar(u+' has unmuted his audio');
    });

    this.client.on(ClientEvent.RemoveVideoMuted, evt => {
      console.log('RemoteVideoUnmuted');
      this.remoteVideoStatus = false;
      let u = this.appointmentDetail.patient_name;
      if(this.userType == 'Patient') {
        u = this.appointmentDetail.doctor_name;
      }
      this.alertService.showSnackBar(u+' has disabled his video');
    });

    this.client.on(ClientEvent.RemoteVideoUnmuted, evt => {
      console.log('RemoteVideoUnmuted');
      this.remoteVideoStatus = true;
      let u = this.appointmentDetail.patient_name;
      if(this.userType == 'Patient') {
        u = this.appointmentDetail.doctor_name;
      }
      this.alertService.showSnackBar(u+' has enabled his video');
    });

    this.client.on(ClientEvent.RemoteStreamRemoved, evt => {
      const stream = evt.stream as Stream;
      if (stream) {
        stream.stop();
        this.remoteCalls = [];
        console.log(`Remote stream is removed ${stream.getId()}`);
      }
    });

    this.client.on(ClientEvent.PeerLeave, evt => {
      const stream = evt.stream as Stream;
      if (stream) {
        stream.stop();
        this.remoteCalls = this.remoteCalls.filter(call => call !== `${this.getRemoteId(stream)}`);
        console.log(`${evt.uid} left from this channel`);
        let u = this.appointmentDetail.patient_name;
        if(this.userType == 'Patient') {
          u = this.appointmentDetail.doctor_name;
        }
        this.alertService.showSnackBar(u+' has disconnected from consultation');
      }
    });
  }

  private getRemoteId(stream: Stream): string {
    return `agora_remote-${stream.getId()}`;
  }

  /**
   * Attempts to connect to an online chat room where users can host and receive A/V streams.
   */
  join(onSuccess?: (uid: number | string) => void, onFailure?: (error: Error) => void): void {
    console.log('join');
    this.client.join(this.agoraToken, this.channelName, parseInt(this.userID), onSuccess, onFailure);
  }

  /**
   * Attempts to upload the created local A/V stream to a joined chat room.
   */
  publish(): void {
    console.log('publish');
    this.client.publish(this.localStream, err => {
        console.log('Publish local stream error: ' + err);
      }
    );
  }

  unpublish(): void {
    console.log('unpublish');
    this.client.unpublish(this.localStream, err => {
        console.log('Unpublish local stream error: ' + err);
      }
    );
  }

  leaveCall() {
    console.log('this.ngxAgoraService.client', this.ngxAgoraService.client);

    if(this.ngxAgoraService.client == undefined || this.ngxAgoraService.client == null) {
      return false;
    }

    this.ngxAgoraService.client.leave(() => {
      //console.log(this.localStream.isPlaying());
      if(this.localStream) {
        if(this.localStream.isPlaying()) {
          this.localStream.stop();
        };
        this.localStream.close();
      }
      this.localStream = null;
      this.remoteCalls = [];
      this.client = null;
      console.log("Leavel channel successfully");
    }, (err) => {
      //console.log("Leave channel failed");
    });
  }

  openShareHealthRecordModal() {
    this.shareHealthRecordAction = '';
    this.addHealthRecordForm.reset();
    this.modalService.open_modal('#shareHealthRecordModal');
  }

  onChooseShareHealthRecordAction(action:string) {
    this.shareHealthRecordAction = action;
    if(action == 'new') {
      this.record_type = '';
      this.addHealthRecordFileInput = null;
      this.addHealthRecordFormLoader = false
      this.removeHealthRecordFile();
      this.addHealthRecordForm.reset();
      this.ngaddhealthrecordform.resetForm();
    }
  }

  onSubmitShareHealthRecordForm() {
    const selectedHealthRecords = this.addHealthRecordForm.value.records
      .map((checked, i) => checked ? this.healthRecords[i] : null)
      .filter(v => v !== null);

    if(!selectedHealthRecords.length) {
      this.alertService.showValidationErrors('Select alteast one record to share');
      return false;
    }

    for(let i = 0; i < selectedHealthRecords.length; i++) {
      this.chatFormLoader = true;
      let user_id = this.appointmentDetail.user_id;
      let user_name = this.appointmentDetail.user_name;
      let user_image = this.appointmentDetail.patient_image_url;
      if (this.userType != 'Patient') {
        user_id = this.appointmentDetail.doctor_id;
        user_name = this.appointmentDetail.doctor_name;
        user_image = this.appointmentDetail.doctor_image_url;
      }
      const chat_msg = {
        '_id' : Math.round(Math.random() * 1000000),
        'createdAt' : new Date().toISOString(),
        'doctor_id': this.appointmentDetail.doctor_id,
        'patient_id': this.appointmentDetail.user_id,
        'text': selectedHealthRecords[i].name,
        'image_url': selectedHealthRecords[i].file_url,
        'user' : {
          '_id': user_id,
          'avatar': user_image,
          'name': user_name
        }
      };
      console.log(chat_msg);
      const msg = firebase.database().ref('messages/' + this.appointmentDetail.doctor_id + '/' + this.appointmentDetail.user_id + '/').push();
      msg.set(chat_msg).then((resp: any) => {
        this.scrollToBottom();
        this.chatFormLoader = false;
      });
    }

    this.modalService.close_modal('#shareHealthRecordModal');
    this.alertService.show_alert('Records shared successfully');
  }

  onSubmitAddHealthRecordForm() {
    if (this.addHealthRecordForm.valid) {
      this.addHealthRecordFormLoader = true;
      let postData = new FormData();

      postData.append('token', this.commonService.getUserData('token'));
      postData.append('appointment_id', this.appointmentDetail.appointment_id);
      postData.append('user_id', this.appointmentDetail.user_id);
      postData.append('name', this.addHealthRecordForm.value.name);
      postData.append('record_for', this.appointmentDetail.appointment_for);
      postData.append('patient_id', this.appointmentDetail.patient_id);
      postData.append('doctor', this.addHealthRecordForm.value.doctor);
      postData.append('file', this.addHealthRecordFileInput);
      postData.append('record_date', this.addHealthRecordForm.value.record_date.format('YYYY-MM-DD'));
      postData.append('record_type', this.addHealthRecordForm.value.record_type);
      postData.append('description', this.addHealthRecordForm.value.description);

      this.healthRecordService.post(postData).subscribe(
        (response: any) => {
          if (response.status) {
            this.getHealthRecords();
            this.shareHealthRecordAction = '';
          }
          this.addHealthRecordFormLoader = false;
        },
        (error) => { this.addHealthRecordFormLoader = false; },
      );
    }
  }

  onChangeHealthRecordFile(fileInput:any) {
    if (fileInput.target.files && fileInput.target.files[0]) {
      let file = fileInput.target.files[0];

      const allowedFileTypes = ['image/png', 'image/jpeg', 'image/jpg', 'application/pdf'];
      if (!allowedFileTypes.includes(file.type)) {
        this.alertService.showValidationErrors('Only JPG, PNG and PDF files are allowed');
        return false;
      }

      const allowedMaxSize = 5 *1024 * 1024;
      if (file.size > allowedMaxSize) {
        this.alertService.showValidationErrors("Maximum 5MB file allowed");
        return false;
      }

      this.addHealthRecordForm.patchValue({file: "yes"})
      this.addHealthRecordFileInput = file;
      this.ngaddhealthrecordfileinput.nativeElement.value = '';
    }
  }

  removeHealthRecordFile() {
    this.addHealthRecordFileInput = null;
    this.addHealthRecordForm.patchValue({file: ""});
    this.ngaddhealthrecordfileinput.nativeElement.value = '';
  }

  onChangeHealthRecordType(record_type:string) {
    this.addHealthRecordForm.patchValue({record_type: record_type});
    this.record_type = record_type;
  }

}
