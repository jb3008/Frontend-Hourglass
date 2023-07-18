import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { WorkForceComponent } from './work-force.component';
import { WorkerProfileComponent } from './worker-profile/worker-profile.component';

const routes: Routes = [
  { path: '', component: WorkForceComponent },
  { path: 'worker-profile', component: WorkerProfileComponent },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class WorkForceRoutingModule { }
