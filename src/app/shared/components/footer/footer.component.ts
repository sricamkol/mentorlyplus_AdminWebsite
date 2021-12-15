import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { Observable } from 'rxjs';
import { CommonService } from '../../../services/common.service';

@Component({
  selector: 'app-footer',
  templateUrl: './footer.component.html',
  styleUrls: ['./footer.component.css'],
  encapsulation: ViewEncapsulation.None
})
export class FooterComponent implements OnInit {
  isloggedInObservable$: Observable<boolean>;

  constructor(private commonService: CommonService) {
    this.isloggedInObservable$ = this.commonService.isloggedInObservable;
  }

  ngOnInit() { }

}
