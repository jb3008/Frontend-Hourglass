import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { InvoicesComponent } from './invoices.component';
import { InvoicesDetailsComponent } from './invoices-details/invoices-details.component';

const routes: Routes = [
  { path: '', component: InvoicesComponent },
  { path: 'invoices-details', component: InvoicesDetailsComponent },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class InvoicesRoutingModule { }
