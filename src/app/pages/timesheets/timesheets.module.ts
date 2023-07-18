import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { TimesheetsRoutingModule } from './timesheets-routing.module';
import { TimesheetsComponent } from './timesheets.component';
import { MatTableModule } from '@angular/material/table';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatInputModule } from '@angular/material/input';
import { MatPaginatorModule } from '@angular/material/paginator';
import { NgbAccordionModule } from '@ng-bootstrap/ng-bootstrap';
import {MatCheckboxModule} from '@angular/material/checkbox';

import { TimesheetDetailComponent } from './timesheet-detail/timesheet-detail.component';
import { NewTimesheetComponent } from './new-timesheet/new-timesheet.component';
import { TimesheetLogsDrawerComponent } from './timesheet-detail/timesheet-logs-drawer/timesheet-logs-drawer.component';
import { AttachmentLogsDrawerComponent } from './timesheet-detail/attachment-logs-drawer/attachment-logs-drawer.component';
import { InlineSVGModule } from 'ng-inline-svg-2';
import { NewTaskDrawerComponent } from './new-timesheet/new-task-drawer/new-task-drawer.component';
import { SharedModule } from '../shared.modules';


@NgModule({
  declarations: [
    TimesheetsComponent,
    TimesheetDetailComponent,
    NewTimesheetComponent,
    TimesheetLogsDrawerComponent,
    AttachmentLogsDrawerComponent,
    NewTaskDrawerComponent

  ],
  imports: [
    CommonModule,
    TimesheetsRoutingModule,
    SharedModule,
    MatTableModule,
    NgbAccordionModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatCheckboxModule,
    MatInputModule,
    MatPaginatorModule,
    InlineSVGModule
  ]
})
export class TimesheetsModule { }
