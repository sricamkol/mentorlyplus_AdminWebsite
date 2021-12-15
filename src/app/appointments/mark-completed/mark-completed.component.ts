import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import Swal from 'sweetalert2';

import { CommonService } from 'src/app/services/common.service';
import { AppointmentService } from 'src/app/services/appointment.service';
import { AlertService } from 'src/app/services/alert.service';

@Component({
  selector: 'app-mark-completed',
  templateUrl: './mark-completed.component.html',
  styleUrls: ['./mark-completed.component.css']
})
export class MarkCompletedComponent implements OnInit {

  @Input() appointmentDetail:any;
  @Input() btnLabel = '';
  @Input() btnClass = '';
  @Output() contentLoader:EventEmitter<boolean> = new EventEmitter();
  @Output() refreshAppointment = new EventEmitter();

  constructor(
    private appointmentService: AppointmentService,
    private commonService: CommonService,
    private alertService: AlertService
  ) { }

  ngOnInit() {
  }

  markAppointmentCompleted() {
    Swal.fire({
      title: 'Mark this appointment as completed',
      text: 'Are you sure?',
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'OK',
      cancelButtonText: 'Cancel'
    }).then((result) => {
      if (result.value) {
        let putData = {
          token: this.commonService.getUserData('token'),
          appointment_id: this.appointmentDetail.appointment_id
        }
        this.contentLoader.emit(true);
        this.appointmentService.complete_appointment(putData).subscribe(
          (response: any) => {
            console.log(response);
            this.contentLoader.emit(false);
            this.refreshAppointment.emit();
            this.alertService.show_alert(response.message)
          },
          (error) => {
            console.log(error);
            this.contentLoader.emit(false);
          }
        );
      }
    });
  }

}
