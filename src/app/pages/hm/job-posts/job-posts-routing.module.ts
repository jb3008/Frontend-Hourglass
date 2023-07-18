import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { JobPostsComponent } from './job-posts.component';
import { JobPostDetailComponent } from './job-post-detail/job-post-detail.component';
import { CreateJobPostComponent } from './create-job-post/create-job-post.component';

const routes: Routes = [
  { path: '', component: JobPostsComponent ,},
{ path: 'details', component: JobPostDetailComponent },
{ path: 'creat-job-post', component: CreateJobPostComponent }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class JobPostsRoutingModule { }
