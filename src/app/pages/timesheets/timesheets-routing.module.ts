import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { TimesheetsComponent } from './timesheets.component';
import { TimesheetDetailComponent } from './timesheet-detail/timesheet-detail.component';
import { NewTimesheetComponent } from './new-timesheet/new-timesheet.component';

const routes: Routes = [
  { path: '', component: TimesheetsComponent },
  { path: 'timesheet-detail', component: TimesheetDetailComponent },
  { path: 'new-timesheet', component: NewTimesheetComponent },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class TimesheetsRoutingModule { }
