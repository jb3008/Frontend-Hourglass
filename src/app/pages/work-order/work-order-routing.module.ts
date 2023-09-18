import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { WorkOrderComponent } from './work-order.component';
import { WorkOrderDetailComponent } from './work-order-detail/work-order-detail.component';
import { TimesheetLogsComponent } from './timesheet-logs/timesheet-logs.component';

const routes: Routes = [
  { path: '', component: WorkOrderComponent },
  { path: 'details', component: WorkOrderDetailComponent },
  { path: 'timesheet-logs', component: TimesheetLogsComponent },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class WorkOrderRoutingModule {}
