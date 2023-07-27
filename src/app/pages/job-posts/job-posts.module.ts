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
import { MatSelectModule } from '@angular/material/select';

import {MatDatepickerModule} from '@angular/material/datepicker';
import {MatNativeDateModule} from '@angular/material/core';
import {MatTabsModule} from '@angular/material/tabs';
import { JobPostDetailComponent } from './job-post-detail/job-post-detail.component';
import { CreateJobPostComponent } from './create-job-post/create-job-post.component';
import { SharedModule } from '../shared.modules';
import { ViewOfferLetterDrawerComponent } from './job-post-detail/view-offer-letter-drawer/view-offer-letter-drawer.component';
import { JobSeekerComponent } from './job-seeker/job-seeker.component';
// import { MatDialogModule } from '@angular/material/dialog';
import { NgbTooltipModule } from '@ng-bootstrap/ng-bootstrap';
import { ModalsModule } from 'src/app/_metronic/partials';
import { NgxDocViewerModule } from 'ngx-doc-viewer';


@NgModule({
  declarations: [
    JobPostsComponent,
    JobPostDetailComponent,
    CreateJobPostComponent,
    ViewOfferLetterDrawerComponent,
    JobSeekerComponent
    
  ],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    CKEditorModule,
    MatSelectModule,
    JobPostsRoutingModule,
    MatTableModule,
    SharedModule,
    MatPaginatorModule,
    MatDatepickerModule,
    MatInputModule,
    MatNativeDateModule,
    MatTabsModule,
    InlineSVGModule,
    // MatDialogModule,
    NgbTooltipModule,
    ModalsModule,
    NgxDocViewerModule
  ]
})
export class JobPostsModule { }
