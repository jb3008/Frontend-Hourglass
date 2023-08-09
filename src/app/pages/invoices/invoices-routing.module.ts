import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { InvoicesComponent } from './invoices.component';
import { InvoicesDetailsComponent } from './invoices-details/invoices-details.component';
import { NewInvoiceComponent } from './new-invoice/new-invoice.component';

const routes: Routes = [
  { path: '', component: InvoicesComponent },
  { path: 'invoices-details/:invoiceId', component: InvoicesDetailsComponent },
  { path: 'new-invoice', component: NewInvoiceComponent },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class InvoicesRoutingModule {}
