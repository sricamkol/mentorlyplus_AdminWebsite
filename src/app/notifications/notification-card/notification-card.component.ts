import { Component, OnInit, ViewEncapsulation, Input } from '@angular/core'

@Component({
    selector : 'app-notification-card',
    templateUrl : './notification-card.component.html',
    encapsulation: ViewEncapsulation.None
})

export class NotificationCardComponent implements OnInit {
    @Input() notifications = [];
    constructor () {}

    ngOnInit() { }
}