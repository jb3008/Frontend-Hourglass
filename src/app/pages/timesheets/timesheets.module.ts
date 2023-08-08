import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { TimesheetsRoutingModule } from './timesheets-routing.module';
import { TimesheetsComponent } from './timesheets.component';
import { MatTableModule } from '@angular/material/table';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule, MatOption } from '@angular/material/core';
import { MatInput, MatInputModule } from '@angular/material/input';
import { MatPaginatorModule } from '@angular/material/paginator';
import { NgbAccordionModule } from '@ng-bootstrap/ng-bootstrap';
import { MatCheckboxModule } from '@angular/material/checkbox';

import { TimesheetDetailComponent } from './timesheet-detail/timesheet-detail.component';
import { NewTimesheetComponent } from './new-timesheet/new-timesheet.component';
import { TimesheetLogsDrawerComponent } from './timesheet-detail/timesheet-logs-drawer/timesheet-logs-drawer.component';
import { AttachmentLogsDrawerComponent } from './timesheet-detail/attachment-logs-drawer/attachment-logs-drawer.component';
import { InlineSVGModule } from 'ng-inline-svg-2';
import { NewTaskDrawerComponent } from './new-timesheet/new-task-drawer/new-task-drawer.component';
import { SharedModule } from '../shared.modules';
import { MatSelectModule } from '@angular/material/select';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgbTooltipModule } from '@ng-bootstrap/ng-bootstrap';
import { NewTaskDrawerDetailComponent } from './timesheet-detail/new-task-drawer-detail/new-task-drawer-detail.component';
import { NgxDocViewerModule } from 'ngx-doc-viewer';
import { ModalsModule } from 'src/app/_metronic/partials';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatSortModule } from '@angular/material/sort';
@NgModule({
  declarations: [
    TimesheetsComponent,
    TimesheetDetailComponent,
    NewTimesheetComponent,

    NewTaskDrawerComponent,
    NewTaskDrawerDetailComponent,
  ],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    TimesheetsRoutingModule,
    SharedModule,
    MatTableModule,
    NgbAccordionModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatCheckboxModule,
    MatInputModule,
    MatPaginatorModule,
    InlineSVGModule,
    MatInputModule,
    MatSelectModule,
    NgbTooltipModule,
    NgxDocViewerModule,
    ModalsModule,
    MatAutocompleteModule,
    MatSortModule,
  ],
})
export class TimesheetsModule {}
