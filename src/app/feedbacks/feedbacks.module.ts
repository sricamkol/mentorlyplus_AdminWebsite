import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ContentLoaderModule } from '@ngneat/content-loader';
import { NgxPaginationModule } from 'ngx-pagination';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatDatepickerModule, MatNativeDateModule, MatFormFieldModule, MatInputModule } from '@angular/material';
import { FeedbacksRoutingModule } from './feedbacks-routing.module';
import { FeedbacksComponent } from './feedbacks.component';
import { FeedbackCardComponent } from './feedback-card/feedback-card.component';


@NgModule({
  declarations: [
    FeedbacksComponent,
    FeedbackCardComponent
  ],
  imports: [
    CommonModule,
    FeedbacksRoutingModule,
    ContentLoaderModule,
    NgxPaginationModule,
    FormsModule,
    ReactiveFormsModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatFormFieldModule,
    MatInputModule
  ],
  exports: [FeedbackCardComponent,
    MatDatepickerModule,
    MatNativeDateModule,
    MatFormFieldModule,
    MatInputModule
  ]
})
export class FeedbacksModule { }
