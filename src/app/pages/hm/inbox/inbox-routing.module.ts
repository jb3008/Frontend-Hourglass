import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { InboxComponent } from './inbox.component';
import { TimesheetsComponent } from './timesheets/timesheets.component';
import { WorkOrdersComponent } from './work-orders/work-orders.component';
import { InvoicesComponent } from './invoices/invoices.component';
import { InvoicesDetailsComponent } from './invoices-details/invoices-details.component';
import { TimesheetsDetailsComponent } from './timesheets-details/timesheets-details.component';
import { WorkOrdersDetailsComponent } from './work-orders-details/work-orders-details.component';

const routes: Routes = [
  { path: '', component: InboxComponent },
  {
    path: 'work-orders',
    component: WorkOrdersComponent,
    //   children: [
    //     { path: 'dd', component: WorkOrdersDetailsComponent},

    //     // { path: 'user-information', component: UserInformationComponent},
    //     // { path: 'companys-information', component: CompanysInformationComponent}
    // ]
  },
  { path: 'work-orders-details', component: WorkOrdersDetailsComponent },
  { path: 'timesheets', component: TimesheetsComponent },
  { path: 'hm/timesheets', component: TimesheetsComponent },
  { path: 'timesheets-details', component: TimesheetsDetailsComponent },
  { path: 'invoices', component: InvoicesComponent },
  { path: 'invoices-details', component: InvoicesDetailsComponent },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class InboxRoutingModule {}
