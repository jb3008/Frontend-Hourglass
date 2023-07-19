import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { WorkForceRoutingModule } from './work-force-routing.module';
import { WorkForceComponent } from './work-force.component';
import { WorkerProfileComponent } from './worker-profile/worker-profile.component';
import { ModalsModule } from '../../_metronic/partials';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { SharedModule } from '../shared.modules';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatInputModule } from '@angular/material/input';
import { MatNativeDateModule } from '@angular/material/core';
@NgModule({
  declarations: [WorkForceComponent, WorkerProfileComponent],
  imports: [
    CommonModule,
    FormsModule,
    WorkForceRoutingModule,
    ModalsModule,
    FormsModule,
    ReactiveFormsModule,
    SharedModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatInputModule,
  ],
  providers: [MatDatepickerModule, MatNativeDateModule],
})
export class WorkForceModule {}
