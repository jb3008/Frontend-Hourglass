import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { InboxComponent } from './inbox.component';
import { TimesheetsComponent } from './timesheets/timesheets.component';
import { WorkOrdersComponent } from './work-orders/work-orders.component';
import { InvoicesComponent } from './invoices/invoices.component';

const routes: Routes = [
  { path: '', component: InboxComponent },
  { path: 'work-orders', component: WorkOrdersComponent },
  { path: 'timesheets', component: TimesheetsComponent },
  { path: 'invoices', component: InvoicesComponent },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class InboxRoutingModule { }
