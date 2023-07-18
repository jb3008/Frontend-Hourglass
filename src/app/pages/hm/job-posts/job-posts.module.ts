import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import { MatInputModule } from '@angular/material/input';
import { JobPostsRoutingModule } from './job-posts-routing.module';
import { JobPostsComponent } from './job-posts.component';
import {MatTableModule} from '@angular/material/table';
import {MatPaginatorModule} from '@angular/material/paginator';
import { InlineSVGModule } from 'ng-inline-svg-2';
import { CKEditorModule } from '@ckeditor/ckeditor5-angular';

import {MatDatepickerModule} from '@angular/material/datepicker';
import {MatNativeDateModule} from '@angular/material/core';
import {MatTabsModule} from '@angular/material/tabs';

import { JobPostDetailComponent } from './job-post-detail/job-post-detail.component';
import { CreateJobPostComponent } from './create-job-post/create-job-post.component';
import { NgbDropdownModule, NgbTooltipModule } from '@ng-bootstrap/ng-bootstrap';
import { AddInvoiceDrawerComponent } from './job-post-detail/add-invoice-drawer/add-invoice-drawer.component';
import { ApplicationDrawerComponent } from './job-post-detail/application-drawer/application-drawer.component';
import { SharedModule } from '../../shared.modules';
import { MatSelectModule } from '@angular/material/select';
import { MatDialogModule } from '@angular/material/dialog';
import { SendOfferLetterDrawerComponent } from './job-post-detail/send-offer-letter-drawer/send-offer-letter-drawer.component';
import { LogsDrawerComponent } from './job-post-detail/logs-drawer/logs-drawer.component';
import { ChatDrawerComponent } from './job-post-detail/chat-drawer/chat-drawer.component';


@NgModule({
  declarations: [
    JobPostsComponent,
    JobPostDetailComponent,
    CreateJobPostComponent,
    ApplicationDrawerComponent,
    AddInvoiceDrawerComponent,
    SendOfferLetterDrawerComponent,
    LogsDrawerComponent,
    ChatDrawerComponent
    
  ],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    CKEditorModule,
    NgbDropdownModule ,
    JobPostsRoutingModule,
    SharedModule,
    MatTableModule,
    MatPaginatorModule,
    MatDatepickerModule,
    MatInputModule,
    MatNativeDateModule,
    MatTabsModule,
    InlineSVGModule,
    MatSelectModule,
    MatDialogModule,
    NgbTooltipModule
  ]
})
export class JobPostsModule { }
