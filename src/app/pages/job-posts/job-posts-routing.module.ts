import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { JobPostsComponent } from './job-posts.component';
import { JobPostDetailComponent } from './job-post-detail/job-post-detail.component';
import { CreateJobPostComponent } from './create-job-post/create-job-post.component';
import { JobSeekerComponent } from './job-seeker/job-seeker.component';

const routes: Routes = [
  { path: '', component: JobPostsComponent ,},
{ path: 'details', component: JobPostDetailComponent },
{ path: 'creat-job-post', component: CreateJobPostComponent },
{ path: 'job-seeker', component: JobSeekerComponent },


];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class JobPostsRoutingModule { }
