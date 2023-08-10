import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { WorkForceRoutingModule } from './work-force-routing.module';
import { WorkForceComponent } from './work-force.component';
import { WorkerProfileComponent } from './worker-profile/worker-profile.component';
import { DropdownMenusModule, ModalsModule } from '../../_metronic/partials';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { SharedModule } from '../shared.modules';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatInputModule } from '@angular/material/input';
import { MatNativeDateModule } from '@angular/material/core';
import { NgbTooltipModule } from '@ng-bootstrap/ng-bootstrap';
import { NgxDocViewerModule } from 'ngx-doc-viewer';
import { MatSelectModule } from '@angular/material/select';
import { MatDialogModule } from '@angular/material/dialog';

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
    MatSelectModule,
    NgbTooltipModule,
    NgxDocViewerModule,
    DropdownMenusModule,
    MatDialogModule,
  ],
  providers: [MatDatepickerModule, MatNativeDateModule],
})
export class WorkForceModule {}
