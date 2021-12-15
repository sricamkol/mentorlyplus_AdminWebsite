import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { OrdersService } from '../../services/orders.service';
import { CommonService } from '../../services/common.service';
import { Title } from '@angular/platform-browser';
import { AlertService } from '../../services/alert.service';

@Component({
  selector: 'app-order-detail',
  templateUrl: './order-detail.component.html',
  styleUrls: ['./order-detail.component.css'],
  encapsulation: ViewEncapsulation.None
})
export class OrderDetailComponent implements OnInit {
  orderDetail:any;
  order_id=''
  loader=false;
  dataReady=false;
  addForm:FormGroup;
  addFormAction = false;
  statusData=[];

  constructor(
    private title: Title,
    private activatedRoute: ActivatedRoute,
	  private router: Router,
    private formBuilder: FormBuilder,
    private commonService: CommonService,
    private ordersService: OrdersService,
    private alertService: AlertService
  ) {
    this.title.setTitle('Order Detail');
  }

  ngOnInit() {
    this.activatedRoute.params.subscribe(
      routeParams => {
        this.order_id = routeParams.order_id;
        if(this.order_id) {
          this.getOrderDetail(this.order_id);
        } else {
          this.router.navigate(['/orders']);
        }
      }
    );
    this.addForm = this.formBuilder.group({
      order_status : ['', [
        Validators.required,
        Validators.minLength(2),
        Validators.maxLength(50)
      ]],
      notify_customer : ['',[]],
      comment:['',[
        Validators.required,
        Validators.maxLength(1000)
      ]]
    });

  }

  getOrderDetail(order_id:string){
	  this.loader = true;
    this.ordersService.orders_get({"order_id":order_id}).subscribe(
		  (response:any) => {
        if(response.status){
          this.orderDetail = response.data;
          this.dataReady = true;
          this.getOrderStatusList();
        }
        this.loader = false;
      },
      (error)=>{ this.loader = false; }
    );
  }

  download_invoice(order_id:string) {
	  this.loader = true;
    this.ordersService.download_invoice({"order_id":order_id}).subscribe(
      (response:any) => {
        if(response.status) {
          const linkSource = 'data:application/pdf;base64,' + response.data;
          const downloadLink = document.createElement("a");
          const fileName = "order-"+order_id+".pdf";
          downloadLink.href = linkSource;
          downloadLink.download = fileName;
          downloadLink.click();
        }
        this.loader = false;
      },
      (error)=>{ this.loader = false; }
    );
  }

  onSubmitAddForm(){
    if(this.addForm.valid){
      this.addFormAction = true;
	    let notify_customer = 'No';
      if(this.addForm.value.notify_customer){ notify_customer = "Yes"; }
      let putData = {
        "token" : this.commonService.getUserData('token'),
        "order_id" : this.orderDetail.order_id,
		    "order_for":this.orderDetail.order_for,
        "status_code" : this.addForm.value.order_status,
        "message": this.addForm.value.comment,
        "notify_customer": notify_customer
      }
      this.ordersService.updateOrder(putData).subscribe(
        (response:any)=>{
          if(response.status){
            this.alertService.show_alert(response.message);
            this.addForm.patchValue({
			        order_status: "",
              comment: "",
              notify_customer: false,
            });
            this.getOrderDetail(this.orderDetail.order_id);
            this.addFormAction =false;
          }
          this.addFormAction =false;
        },
        (error)=>{ this.addFormAction =false; },
      )
    }
  }

  getOrderStatusList(){
    this.addFormAction =true;
    this.ordersService.getOrderStatusList({'status_for':this.orderDetail.order_for}).subscribe(
      (response:any)=>{
        if(response.status){
          this.addFormAction =false;
          this.statusData = response.data;
        }
        this.addFormAction =false;
      },
      (error)=>{ this.addFormAction =false; }
    )
  }
}
