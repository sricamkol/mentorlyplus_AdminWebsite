import { Component, OnInit, ViewChild, ElementRef, NgZone, ViewEncapsulation } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { FormGroup, FormBuilder, Validators, NgForm } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { MapsAPILoader, MouseEvent } from '@agm/core';
import { Select2OptionData } from 'ng-Select2';
import { Options } from 'select2';
import Swal from 'sweetalert2';
declare let google: any;

import { CommonService } from '../../services/common.service';
import { UserClinicsService } from '../../services/user-clinics.service';
import { UserServicesService } from '../../services/user-services.service';
import { UserDocumentsService } from '../../services/user-documents.service';
import { BankService } from '../../services/bank.service';
import { ModalService } from '../../services/modal.service';
import { AlertService } from '../../services/alert.service';

import { iClinic } from '../../services/interface/i-clinic';
import { iRequiredDocs } from '../../services/interface/i-required-docs';
import { iClinicAttachment } from 'src/app/services/interface/i-clinic-attachment';
import { iBank } from 'src/app/services/interface/i-bank';
import { iService } from 'src/app/services/interface/i-service';

@Component({
  selector: 'app-clinic-update',
  templateUrl: './clinic-update.component.html',
  styleUrls: ['./clinic-update.component.css'],
  encapsulation: ViewEncapsulation.None
})

export class ClinicUpdateComponent implements OnInit {
  userType = '';
  user_id = '';
  clinic_id = '';

  activeTab = '';

  dataLoader = true;
  clinicDetail:iClinic;

  @ViewChild('ngimagesfileinput', { static: false }) ngimagesfileinput: ElementRef;
  filesB64SrcArray = [];

  infoForm: FormGroup;
  infoFormLoader = false;
  emailRegex = this.commonService.emailRegex;
  @ViewChild('nginfoform', { static: false} ) nginfoform: NgForm;
  @ViewChild('nglogofileinput', { static: false }) nglogofileinput: ElementRef;
  logo_image_src = '';
  amenitiesSelect2Options: Options = {width: '100%', multiple: true, tags: true};
  amenitiesSelect2Data: Select2OptionData[];

  locationFormLoader = false;
  @ViewChild('search', { static: false }) searchElementRef: ElementRef;
  @ViewChild('nglocationform', { static: false} ) nglocationform: NgForm;
  latitude = 20.5937;
  longitude = 78.9629;
  zoom = 15;
  address = '';
  private geoCoder;
  locationForm: FormGroup;

  documentFormLoader = false;
  requiredDocs:iRequiredDocs[];

  rejectDocumentFormLoader = false;
  rejectDocumentForm: FormGroup;
  @ViewChild('ngrejectdocumentform', {static: false}) ngrejectdocumentform: NgForm;

  @ViewChild('nggalleryfileinput', { static: false }) nggalleryfileinput: ElementRef;
  galleryFormLoader = false;
  clinicAttachments:iClinicAttachment[];

  serviceDataLoader = false;
  serviceFormLoader = false;
  @ViewChild('ngaddserviceform', { static: false}) ngaddserviceform: NgForm;
  @ViewChild('ngupdateserviceform', { static: false}) ngupdateserviceform: NgForm;
  addServiceForm: FormGroup;
  updateServiceForm: FormGroup;
  service_id:string;
  services:iService[] = [];

  bankDataLoader = false;
  bankFormLoader = false;
  @ViewChild('ngaddbankform', { static: false}) ngaddbankform: NgForm;
  @ViewChild('ngupdatebankform', { static: false}) ngupdatebankform: NgForm;
  addBankForm: FormGroup;
  updateBankForm: FormGroup;
  bank_id:string;
  banks:iBank[];

  constructor(
    private title: Title,
    private formBuilder: FormBuilder,
    private mapsAPILoader: MapsAPILoader,
    private router: Router,
    private ngZone: NgZone,
    private activatedRoute: ActivatedRoute,

    private commonService: CommonService,
    private userClinicsService: UserClinicsService,
    private userServicesService: UserServicesService,
    private userDocumentsService: UserDocumentsService,
    private bankService: BankService,
    private modalService: ModalService,
    private alertService: AlertService
  ) {
    this.title.setTitle('Update Establishment');
    this.userType = this.commonService.getUserData('group_name');
    let clinic_id = this.commonService.getUserData('clinic_id');
    const allowedUserTypes = ['Doctor', 'Clinic', 'Super Admin'];
    if (!allowedUserTypes.includes(this.userType)) {
      this.commonService.userDefaultRoute();
    }
    if(this.userType == 'Clinic') {
      this.clinic_id = clinic_id;
      this.getClinicDetail();
    } else {
      this.activatedRoute.queryParamMap.subscribe(params => {
        this.clinic_id = params.get('id');
        this.user_id = params.get('user_id');
        this.getClinicDetail();
      });
    }

    this.activatedRoute.queryParamMap.subscribe(params => {
      this.activeTab = params.get('tab') ? params.get('tab') : 'info';
    });

    this.infoForm = this.formBuilder.group({
      /* logo_image: ['', Validators.required], */
      name: ['', [
        Validators.required,
        Validators.minLength(2),
        Validators.maxLength(150)
      ]],
      email: ['', [
        Validators.required,
        Validators.email,
        Validators.pattern(this.emailRegex)
      ]],
      phone_number: ['', [
        Validators.required,
        Validators.minLength(6),
        Validators.maxLength(15),
      ]],
      introduction: ['', [
        Validators.required,
        Validators.minLength(20),
        Validators.maxLength(1000),
      ]],
      work_schedule: ['', [
        Validators.required,
        Validators.maxLength(250),
      ]],
      status: ['Active', [
        Validators.required
      ]],
      set_default: ['Yes', [
        Validators.required
      ]],
      amenities: ['']
    });

    this.locationForm = this.formBuilder.group({
      clinic_country: ['', [
        Validators.required,
        Validators.maxLength(50)
      ]],
      clinic_region: ['', [
        Validators.required,
        Validators.maxLength(50)
      ]],
      clinic_city: ['', [
        Validators.required,
        Validators.maxLength(100)
      ]],
      clinic_postal_code: ['', [
        Validators.required,
        Validators.minLength(6),
        Validators.maxLength(6)
      ]],
      clinic_address: ['', [
        Validators.required,
        Validators.minLength(2),
        Validators.maxLength(250)
      ]],
      clinic_latitude: ['', [
        Validators.maxLength(20)
      ]],
      clinic_longitude: ['', [
        Validators.maxLength(20)
      ]],
    });

    this.addServiceForm = this.formBuilder.group({
      title: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(200)]],
      service_type: ['Virtual', [Validators.required]],
      service_fee: ['', [Validators.required, Validators.maxLength(8)]],
      instructions: ['', [Validators.required, Validators.maxLength(1000)]],
      status: ['Active', [Validators.required]]
    });

    this.updateServiceForm = this.formBuilder.group({
      title: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(200)]],
      service_type: ['Virtual', [Validators.required]],
      service_fee: ['', [Validators.required, Validators.maxLength(8)]],
      instructions: ['', [Validators.required, Validators.maxLength(1000)]],
      status: ['Active', [Validators.required]]
    });

    this.addBankForm = this.formBuilder.group({
      bank_name: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(100)]],
      account_holder_name: ['', [Validators.required, Validators.minLength(4), Validators.maxLength(120)]],
      account_number: ['', [Validators.required, Validators.minLength(5), Validators.maxLength(35)]],
      bank_code: ['', [Validators.required, Validators.minLength(11), Validators.maxLength(11)]],
      is_default: ['', [Validators.required]]
    });

    this.updateBankForm = this.formBuilder.group({
      bank_name: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(100)]],
      account_holder_name: ['', [Validators.required, Validators.minLength(4), Validators.maxLength(120)]],
      account_number: ['', [Validators.required, Validators.minLength(5), Validators.maxLength(35)]],
      bank_code: ['', [Validators.required, Validators.minLength(11), Validators.maxLength(11)]],
      is_default: ['', [Validators.required]]
    });

    this.rejectDocumentForm = this.formBuilder.group({
      reason: ['', [
        Validators.required,
        Validators.maxLength(200)
      ]]
    });
  }

  ngOnInit() {
    this.initializeMap();
  }

  getClinicDetail() {
    let params = {clinic_id:this.clinic_id};
    if(this.userType == 'Super Admin') {
      params['user_id'] = this.user_id;
    }
    this.userClinicsService.get(params).subscribe(
      (response: any) => {
        if (response.status) {
          this.clinicDetail = response.data

          this.user_id = this.clinicDetail.user_id;
          //Info Form
          this.infoForm.patchValue({
            /* logo_image: this.clinicDetail.logo_image, */
            name: this.clinicDetail.clinic_name,
            email: this.clinicDetail.clinic_email,
            introduction: this.clinicDetail.introduction,
            phone_number: this.clinicDetail.clinic_phone_number,
            work_schedule: this.clinicDetail.work_schedule,
            amenities: this.clinicDetail.clinic_amenities,
            status: this.clinicDetail.status,
            set_default: this.clinicDetail.is_default
          });
          this.amenitiesSelect2Data = this.clinicDetail.clinic_amenities;
          this.logo_image_src = this.clinicDetail.logo_image_url;

          //Location Form
          this.locationForm.patchValue({
            clinic_country: this.clinicDetail.clinic_country,
            clinic_region: this.clinicDetail.clinic_region,
            clinic_city: this.clinicDetail.clinic_city,
            clinic_address: this.clinicDetail.clinic_address,
            clinic_latitude: this.clinicDetail.clinic_latitude,
            clinic_longitude: this.clinicDetail.clinic_longitude,
            clinic_postal_code: this.clinicDetail.clinic_postal_code
          });
          this.latitude = this.clinicDetail.clinic_latitude;
          this.longitude = this.clinicDetail.clinic_longitude;

          //Document Form
          this.getRequiredDocs();

          //Gallery Form
          this.clinicAttachments = this.clinicDetail.clinic_attachments;

          //Serivces Form
          this.getServices();

          //Bank Form
          this.getBanks();

          this.dataLoader = false;
        } else {
          this.router.navigate(['/my-establishments']);
        }
      },
      (error) => {
        this.dataLoader = false;
        this.router.navigate(['/my-establishments']);
      }
    );
  }

  initializeMap() {
    this.mapsAPILoader.load().then(() => {
      this.setCurrentLocation();
      this.geoCoder = new google.maps.Geocoder;
      let autocomplete = new google.maps.places.Autocomplete(this.searchElementRef.nativeElement);
      autocomplete.addListener("place_changed", () => {
        this.ngZone.run(() => {
          //get the place result
          let place: google.maps.places.PlaceResult = autocomplete.getPlace();
          //verify result
          if (place.geometry === undefined || place.geometry === null) {
            return;
          }

          let country, region, city, postal_code = '';
          for (var i = 0; i < place.address_components.length; i++) {
            for (var j = 0; j < place.address_components[i].types.length; j++) {
              if (place.address_components[i].types[j] == "country") {
                country = place.address_components[i].long_name;
              }
              if (place.address_components[i].types[j] == "administrative_area_level_1") {
                region = place.address_components[i].long_name;
              }
              if (place.address_components[i].types[j] == "administrative_area_level_2") {
                city = place.address_components[i].long_name;
              }
              if (place.address_components[i].types[j] == "postal_code") {
                postal_code = place.address_components[i].long_name;
              }
            }
          }
          //set latitude, longitude and zoom
          this.latitude = place.geometry.location.lat();
          this.longitude = place.geometry.location.lng();
          this.zoom = 15;
          this.locationForm.patchValue({
            clinic_country: country,
            clinic_region: region,
            clinic_city: city,
            clinic_postal_code: postal_code,
            clinic_address: place.formatted_address,
            clinic_latitude: this.latitude,
            clinic_longitude: this.longitude
          });
        });
      });
    });
  }

  setCurrentLocation() {
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition((position) => {
        let latitude = this.latitude ? this.latitude : position.coords.latitude;
        let longitude = this.longitude ? this.longitude : position.coords.longitude;
        if(latitude && longitude) {
          this.latitude = latitude;
          this.longitude = longitude;
        }
        this.zoom = 15;
      });
    }
  }

  markerDragEnd($event: MouseEvent) {
    this.latitude = $event.coords.lat;
    this.longitude = $event.coords.lng;
    this.getAddress(this.latitude, this.longitude);
  }

  getAddress(latitude, longitude) {
    this.geoCoder.geocode({ 'location': { lat: latitude, lng: longitude } }, (results, status) => {
      if (status === 'OK') {
        if (results[0]) {
          let place = results[0];
          let country, region, city, postal_code = '';
          for (var i = 0; i < place.address_components.length; i++) {
            for (var j = 0; j < place.address_components[i].types.length; j++) {
              if (place.address_components[i].types[j] == "country") {
                country = place.address_components[i].long_name;
              }
              if (place.address_components[i].types[j] == "administrative_area_level_1") {
                region = place.address_components[i].long_name;
              }
              if (place.address_components[i].types[j] == "administrative_area_level_2") {
                city = place.address_components[i].long_name;
              }
              if (place.address_components[i].types[j] == "postal_code") {
                postal_code = place.address_components[i].long_name;
              }
            }
          }
          this.zoom = 15;
          this.address = place.formatted_address;
          this.locationForm.patchValue({
            clinic_country: country,
            clinic_region: region,
            clinic_city: city,
            clinic_postal_code: postal_code,
            clinic_address: this.address,
            clinic_latitude: latitude,
            clinic_longitude: longitude
          });
        } else {
          window.alert('No results found');
        }
      } else {
        window.alert('Geocoder failed due to: ' + status);
      }
    });
  }

  onChangeLogo(files: any) {
    if (files.target.files && files.target.files[0]) {
      const allowed_max_size = 2 * 1024 * 1024; //2 MB
      const allowed_types = ['image/png', 'image/jpeg', 'image/jpg'];
      const allowed_max_height = 2000;
      const allowed_max_width = 2000;

      let file = files.target.files[0];

      if (!allowed_types.includes(file.type)) {
        this.alertService.showValidationErrors('Only JPG or PNG files allowed');
        return false;
      }

      if (file.size > allowed_max_size) {
        this.alertService.showValidationErrors('Maximum size allowed is 2 MB');
        return false;
      }

      const reader = new FileReader();
      reader.onload = (e: any) => {
        const provider_image = new Image();
        provider_image.src = e.target.result;
        provider_image.onload = rs => {
          const img_height = rs.currentTarget['height'];
          const img_width = rs.currentTarget['width'];

          if (img_height > allowed_max_height && img_width > allowed_max_width) {
            //this.alertService.showValidationErrors('Maximum dimentions allowed ' + allowed_max_height + '*' + allowed_max_width + 'px');
            //return false;
          }

          let formData = new FormData();
          formData.append('token', this.commonService.getUserData('token'));
          formData.append('clinic_id', this.clinic_id);
          formData.append('logo_image', file);
          this.dataLoader = true;
          this.userClinicsService.update_logo_image(formData).subscribe(
            (response: any) => {
              if (response.status) {
                this.logo_image_src = response.data;
                this.infoForm.patchValue({'logo_image': response.data});
              }
              this.dataLoader = false;
            },
            (error) => { this.dataLoader = false; }
          );
        };
      };
      reader.readAsDataURL(files.target.files[0]);
      this.nglogofileinput.nativeElement.value = '';
    }
  }

  onSubmitInfoForm() {
    if (this.infoForm.valid) {
      let postData = {
        'token': this.commonService.getUserData('token'),
        'clinic_id': this.clinic_id,
        'name': this.infoForm.value.name,
        'email': this.infoForm.value.email,
        'phone_number': this.infoForm.value.phone_number,
        'introduction': this.infoForm.value.introduction,
        'work_schedule': this.infoForm.value.work_schedule,
        'amenities': this.infoForm.value.amenities,
        'status': this.infoForm.value.status,
        'set_default': this.infoForm.value.set_default
      };
      this.infoFormLoader = true;
      this.userClinicsService.update_info(postData).subscribe(
        (response: any) => {
          if (response.status) {
            this.alertService.show_alert(response.message);
          }
          this.infoFormLoader = false;
        },
        (error) => { this.infoFormLoader = false; }
      );
    }
  }

  onSubmitLocationForm() {
    if (this.locationForm.valid) {
      let postData = {
        token: this.commonService.getUserData('token'),
        clinic_id: this.clinic_id,
        clinic_country: this.locationForm.value.clinic_country,
        clinic_region: this.locationForm.value.clinic_region,
        clinic_city: this.locationForm.value.clinic_city,
        clinic_postal_code: this.locationForm.value.clinic_postal_code,
        clinic_address: this.locationForm.value.clinic_address,
        clinic_latitude: this.locationForm.value.clinic_latitude,
        clinic_longitude: this.locationForm.value.clinic_longitude
      };
      this.locationFormLoader = true;
      this.userClinicsService.update_location(postData).subscribe(
        (response: any) => {
          if (response.status) {
            this.alertService.show_alert(response.message);
          }
          this.locationFormLoader = false;
        },
        (error) => { this.locationFormLoader = false; }
      );
    }
  }

  getRequiredDocs() {
    this.documentFormLoader = true;
    let params = {type:'clinic', clinic_id:this.clinic_id};
    if(this.userType == 'Super Admin') {
      params['user_id'] = this.user_id;
    }
    this.userDocumentsService.required_docs(params).subscribe(
      (response:any) => {
        this.requiredDocs = response;
        this.documentFormLoader = false;
      },
      (error) => { this.documentFormLoader = false; }
    );
  }

  onChangeDocument(files: any, key:string) {
    if (files.target.files && files.target.files[0]) {
      const allowed_max_size = 20 * 1024 * 1024; //20 MB
      const allowed_types = ['image/png', 'image/jpeg', 'image/jpg'];
      const allowed_max_height = 2000;
      const allowed_max_width = 2000;

      let file = files.target.files[0];

      if (!allowed_types.includes(file.type)) {
        this.alertService.showValidationErrors('Only JPG or PNG files allowed');
        return false;
      }

      if (file.size > allowed_max_size) {
        this.alertService.showValidationErrors('Maximum size allowed is 20 MB');
        return false;
      }

      const reader = new FileReader();
      reader.onload = (e: any) => {
        const provider_image = new Image();
        provider_image.src = e.target.result;
        provider_image.onload = rs => {
          const img_height = rs.currentTarget['height'];
          const img_width = rs.currentTarget['width'];

          if (img_height > allowed_max_height && img_width > allowed_max_width) {
            //this.alertService.showValidationErrors('Maximum dimentions allowed ' + allowed_max_height + '*' + allowed_max_width + 'px');
            //return false;
          }

          let formData = new FormData();
          formData.append('token', this.commonService.getUserData('token'));
          formData.append('clinic_id', this.clinic_id);
          formData.append('title', key);
          formData.append('document_file', file);
          this.documentFormLoader = true;
          this.userDocumentsService.create_update(formData).subscribe(
            (response: any) => {
              if (response.status) {
                this.getRequiredDocs();
              }
              this.documentFormLoader = false;
            },
            (error) => { this.documentFormLoader = false; }
          );
        };
      };
      reader.readAsDataURL(files.target.files[0]);
    }
  }

  deleteDocument(document_id:string) {
    Swal.fire({
      title: 'Delete',
      text: 'Are you sure?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'OK',
      cancelButtonText: 'Cancel'
    }).then((result) => {
      if (result.value) {
        let formData = {
          document_id: document_id
        }
        this.documentFormLoader = true;
        this.userDocumentsService.delete(formData).subscribe(
          (response: any) => {
            if (response.status) {
              this.getRequiredDocs();
              this.alertService.show_alert(response.message);
            }
            this.documentFormLoader = false;
          },
          (error) => { this.documentFormLoader = false; }
        )
      }
    });
  }

  document_id='';
  verification_status='';
  updateVerification(document_id:string, verification_status:string) {
    this.document_id = document_id;
    this.verification_status = verification_status;

    if(verification_status == 'Rejected') {
      this.ngrejectdocumentform.resetForm();
      this.modalService.open_modal('#rejectDocumentFormModal');
      return false;
    }

    Swal.fire({
      title: 'Mark this document as verified',
      text: 'Are you sure?',
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'OK',
      cancelButtonText: 'Cancel'
    }).then((result) => {
      if (result.value) {
        let formData = {
          token: this.commonService.getUserData('token'),
          document_id: document_id,
          verification_status: 'Verified'
        }
        this.documentFormLoader = true;
        this.userDocumentsService.update_verification(formData).subscribe(
          (response: any) => {
            if (response.status) {
              this.getRequiredDocs();
              this.alertService.show_alert(response.message);
            }
            this.documentFormLoader = false;
          },
          (error) => { this.documentFormLoader = false; }
        )
      }
    });
  }

  submitRejectDocumentForm() {
    let formData = {
      token: this.commonService.getUserData('token'),
      document_id: this.document_id,
      verification_status: this.verification_status,
      reason: this.rejectDocumentForm.value.reason
    }
    this.rejectDocumentFormLoader = true;
    this.userDocumentsService.update_verification(formData).subscribe(
      (response: any) => {
        if (response.status) {
          this.getRequiredDocs();
          this.modalService.close_modal('#rejectDocumentFormModal');
          this.alertService.show_alert(response.message);
        }
        this.rejectDocumentFormLoader = false;
      },
      (error) => { this.rejectDocumentFormLoader = false; }
    )
  }

  getGalleryImages() {
    this.galleryFormLoader = true;
    this.userClinicsService.get_attachment({'clinic_id':this.clinic_id}).subscribe(
      (response:any) => {
        if(response.status) {
          this.clinicAttachments = response.data;
        }
        this.galleryFormLoader = false;
      }
    );
  }

  onChangeGalleryImages(files: any) {
    let formData = new FormData();
    formData.append('token', this.commonService.getUserData('token'));
    formData.append('clinic_id', this.clinic_id);
    for(let i=0; i<files.target.files.length; i++) {
      const allowed_max_size = 2 * 1024 * 1024; //2 MB
      const allowed_types = ['image/png', 'image/jpeg', 'image/jpg'];
      const allowed_max_height = 2000;
      const allowed_max_width = 2000;
      let file = files.target.files[i];

      if (!allowed_types.includes(file.type)) {
        //this.alertService.showValidationErrors('Only JPG or PNG files allowed');
        //return false;
        continue;
      }

      if (file.size > allowed_max_size) {
        //this.alertService.showValidationErrors('Maximum size allowed is 2 MB');
        //return false;
        continue;
      }
      formData.append(`clinic_attachments[${i}]`, file);
    }
    this.nggalleryfileinput.nativeElement.value = '';
    this.galleryFormLoader = true;
    this.userClinicsService.upload_attachment(formData).subscribe(
      (response: any) => {
        if (response.status) {
          this.getGalleryImages();
        } else {
          this.galleryFormLoader = false;
        }
      },
      (error) => { this.galleryFormLoader = false; }
    );
  }

  deleteGalleryImage(id:string, i:number) {
    let formData = {
      'token': this.commonService.getUserData('token'),
      'clinic_id': this.clinic_id,
      'id': id
    }
    this.galleryFormLoader = true;
    this.userClinicsService.delete_attachment(formData).subscribe(
      (response:any) => {
        if(response.status) {
          this.clinicAttachments.splice(i, 1);
        }
        this.galleryFormLoader = false;
      }
    );
  }

  getServices() {
    this.services = [];
    this.serviceDataLoader = true;
    let params = {clinic_id:this.clinic_id};
    if(this.userType == 'Super Admin') {
      params['user_id'] = this.user_id;
    }
    this.userServicesService.get(params).subscribe(
      (response: any) => {
        if(response.status) {
          this.services = response.data;
        }
        this.serviceDataLoader = false;
      }
    );
  }

  openAddServiceForm() {
    this.ngaddserviceform.resetForm();
    this.addServiceForm.patchValue({
      service_type: 'Virtual',
      status: 'Active'
    });
    this.modalService.open_modal('#addServiceFormModal');
  }

  onSubmitAddServiceForm() {
    if (this.addServiceForm.valid) {
      let postData = new FormData();
      postData.append('token', this.commonService.getUserData('token'));
      postData.append('clinic_id', this.clinic_id);
      if(this.userType == 'Super Admin') {
        postData.append('user_id', this.user_id);
      }
      postData.append('title', this.addServiceForm.value.title);
      postData.append('service_type', this.addServiceForm.value.service_type);
      postData.append('service_fee', this.addServiceForm.value.service_fee);
      postData.append('status', this.addServiceForm.value.status);
      postData.append('instructions', this.addServiceForm.value.instructions);
      this.serviceFormLoader = true;
      this.userServicesService.create(postData).subscribe(
        (response: any) => {
          if (response.status) {
            this.alertService.show_alert(response.message);
            this.modalService.close_modal('#addServiceFormModal');
            this.getServices();
          }
          this.serviceFormLoader = false;
        },
        (error) => { this.serviceFormLoader = false; },
      );
    }
  }

  openServiceUpdateForm(service_id: string, index: number) {
    this.service_id = service_id;
    this.updateServiceForm.patchValue({
      title: this.services[index].title,
      service_type: this.services[index].service_type,
      service_fee: this.services[index].service_fee,
      status: this.services[index].status,
      instructions: this.services[index].instructions,
    });
    this.modalService.open_modal('#updateServiceFormModal');
  }

  onSubmitServiceUpdateForm() {
    if (this.updateServiceForm.valid) {
      let params = {
        token: this.commonService.getUserData('token'),
        service_id: this.service_id,
        title: this.updateServiceForm.value.title,
        service_type: this.updateServiceForm.value.service_type,
        service_fee: this.updateServiceForm.value.service_fee,
        status: this.updateServiceForm.value.status,
        instructions: this.updateServiceForm.value.instructions
      };
      this.serviceFormLoader = true;
      this.userServicesService.update_clinic_service(params).subscribe(
        (response: any) => {
          this.serviceFormLoader = false;
          if (response.status) {
            this.alertService.show_alert(response.message);
            this.modalService.close_modal('#updateServiceFormModal');
            this.getServices();
          }
        },
        (error) => { this.serviceFormLoader = false; }
      );
    }
  }

  onDeleteService(service_id:string) {
    Swal.fire({
      title: 'Delete',
      text: 'Are you sure?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'OK',
      cancelButtonText: 'Cancel'
    }).then((result) => {
      if (result.value) {
        this.serviceDataLoader = true;
        this.userServicesService.delete({service_id: service_id}).subscribe(
          (response: any) => {
            if (response.status) {
              this.alertService.show_alert(response.message);
              this.getServices();
            }
            this.serviceDataLoader = false;
          }
        );
      }
    });
  }

  getBanks() {
    this.bankDataLoader = true;
    let params = {clinic_id:this.clinic_id};
    if(this.userType == 'Super Admin') {
      params['user_id'] = this.user_id;
    }
    this.bankService.get(params).subscribe(
      (response: any) => {
        if(response.status) {
          this.banks = response.data;
        }
        this.bankDataLoader = false;
      }
    );
  }

  setDefaultBank(bank_id: string, clinic_id:string) {
    this.bankDataLoader = true;
    this.bankService.set_default({'bank_id': bank_id, 'clinic_id': clinic_id}).subscribe(
      (response: any) => {
        if (response.status) {
          this.alertService.show_alert(response.message);
          this.getBanks();
        } else {
          this.bankDataLoader = false;
        }
      }
    )
  }

  openBankAddForm() {
    this.ngaddbankform.resetForm();
    this.modalService.open_modal('#addBankModal');
  }

  onSubmitAddBankForm() {
    if (this.addBankForm.valid) {
      let postData = new FormData();
      postData.append('token', this.commonService.getUserData('token'));
      postData.append('clinic_id', this.clinic_id);
      postData.append('account_holder_name', this.addBankForm.value.account_holder_name);
      postData.append('bank_name', this.addBankForm.value.bank_name);
      postData.append('account_number', this.addBankForm.value.account_number);
      postData.append('bank_code', this.addBankForm.value.bank_code);
      postData.append('is_default', this.addBankForm.value.is_default);
      this.bankFormLoader = true;
      this.bankService.create(postData).subscribe(
        (response: any) => {
          if (response.status) {
            this.alertService.show_alert(response.message);
            this.modalService.close_modal('#addBankModal');
            this.addBankForm.reset();
            this.ngaddbankform.resetForm();
            this.getBanks();
          }
          this.bankFormLoader = false;
        },
        (error) => { this.bankFormLoader = false; },
      );
    }
  }

  openBankUpdateForm(bank_id: string, clinic_id: string) {
    this.bankDataLoader = true;
    this.bank_id = bank_id;
    this.bankService.get({'bank_id':bank_id, 'clinic_id':clinic_id}).subscribe(
      (response: any) => {
        if (response.status) {
          let bankDetail = response.data;
          this.updateBankForm.patchValue({
            bank_name: bankDetail.bank_name,
            account_holder_name: bankDetail.account_holder_name,
            account_number: bankDetail.account_number,
            bank_code: bankDetail.bank_code,
            is_default: bankDetail.is_default
          });
          this.modalService.open_modal('#updateBankModal');
          this.bankDataLoader = false;
        }
      }
    );
  }

  onSubmitBankUpdateForm() {
    if (this.updateBankForm.valid) {
      let params = {
        token: this.commonService.getUserData('token'),
        clinic_id: this.clinic_id,
        bank_id: this.bank_id,
        account_holder_name: this.updateBankForm.value.account_holder_name,
        bank_name: this.updateBankForm.value.bank_name,
        account_number: this.updateBankForm.value.account_number,
        bank_code: this.updateBankForm.value.bank_code,
        is_default: this.updateBankForm.value.is_default
      };
      this.bankFormLoader = true;
      this.bankService.update(params).subscribe(
        (response: any) => {
          this.bankFormLoader = false;
          if (response.status) {
            this.alertService.show_alert(response.message);
            this.modalService.close_modal('#updateBankModal');
            this.getBanks();
          }
        },
        (error) => { this.bankFormLoader = false; }
      );
    }
  }

  onDeleteBank(bank_id:string, i:number) {
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
        this.bankService.delete({"bank_id": bank_id}).subscribe(
          (response: any) => {
            if (response.status) {
              this.alertService.show_alert(response.message);
              this.getBanks();
            }
            this.dataLoader = false;
          }
        );
      }
    });
  }

}

