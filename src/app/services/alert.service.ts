import { Injectable } from '@angular/core';
import { SweetAlertIcon  } from 'sweetalert2';
import Swal from 'sweetalert2';
import { MatSnackBar, MatSnackBarHorizontalPosition, MatSnackBarVerticalPosition } from '@angular/material/snack-bar';

@Injectable({
  providedIn: 'root'
})
export class AlertService {

  constructor(
    private matSnackBar: MatSnackBar
  ) { }

  /**
   * alert_icon: success, error, warning, info, question
  */
  show_alert(alert_title='', alert_text='', alert_icon:SweetAlertIcon='success') {
    Swal.fire(
      alert_title,
      alert_text,
      alert_icon
    )
  }

  //Automatically called by service.interceptor.ts when server response is 417 (HTTP_EXPECTATION_FAILED)
  showValidationErrors(errors:any) {
    let prepareError = '<h4 class="alert-heading">There are some errors</h4>';
    if(typeof errors == 'object') {
      for (const property in errors) {
        prepareError += '<div class="invalid-feedback">'+errors[property]+'</div>';
      }
    } else {
      prepareError += '<div class="invalid-feedback">'+errors+'</div>';
    }
    Swal.fire({html: prepareError});
  }

  showSnackBar(message:string, action='x', duration=5, horizontalPosition:MatSnackBarHorizontalPosition='center', verticalPosition:MatSnackBarVerticalPosition='bottom') {
    this.matSnackBar.open(message, action, {
      horizontalPosition: horizontalPosition,
      verticalPosition: verticalPosition,
      duration: duration * 1000
    });
  }
}
