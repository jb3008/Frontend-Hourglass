import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { InboxComponent } from './inbox.component';
import { TimesheetsComponent } from './timesheets/timesheets.component';
import { TimesheetDetailComponent } from './timesheets-details/timesheets-details.component';
import { InvoicesComponent } from './invoices/invoices.component';
import { InvoicesDetailsComponent } from './invoices-details/invoices-details.component';

const routes: Routes = [
  { path: '', component: InboxComponent },

  { path: 'timesheets', component: TimesheetsComponent },
  {
    path: 'timesheets-details/:timeSheetId',
    component: TimesheetDetailComponent,
  },
  { path: 'invoices', component: InvoicesComponent },
  { path: 'invoices-details/:invoiceId', component: InvoicesDetailsComponent },
];
@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class InboxRoutingModule {}
