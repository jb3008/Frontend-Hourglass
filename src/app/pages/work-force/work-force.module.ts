import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { WorkForceRoutingModule } from './work-force-routing.module';
import { WorkForceComponent } from './work-force.component';
import { WorkerProfileComponent } from './worker-profile/worker-profile.component';
import { ModalsModule } from '../../_metronic/partials';

@NgModule({
  declarations: [
    WorkForceComponent,
    WorkerProfileComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    WorkForceRoutingModule,
    ModalsModule

  ]
})
export class WorkForceModule { }
