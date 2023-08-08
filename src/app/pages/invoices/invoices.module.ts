import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { InvoicesRoutingModule } from './invoices-routing.module';
import { InvoicesComponent } from './invoices.component';
import { MatTableModule } from '@angular/material/table';
import { InvoicesDetailsComponent } from './invoices-details/invoices-details.component';
import { MatNativeDateModule } from '@angular/material/core';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatInputModule } from '@angular/material/input';
import { MatPaginatorModule } from '@angular/material/paginator';
import {
  NgbAccordionModule,
  NgbTooltipModule,
} from '@ng-bootstrap/ng-bootstrap';
import { MatCheckboxModule } from '@angular/material/checkbox';

import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NewInvoiceComponent } from './new-invoice/new-invoice.component';
import { MatSelectModule } from '@angular/material/select';
import { InlineSVGModule } from 'ng-inline-svg-2';
import { SharedModule } from '../shared.modules';
import { InvoiceAddTimesheetDrawerComponent } from './new-invoice/invoice-add-timesheet-drawer/invoice-add-timesheet-drawer.component';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { InboxInvoiceAttachmentLogsDrawerComponent } from './invoices-details/inbox-attachment-logs-drawer/inbox-attachment-logs-drawer.component';
import { InboxInvoiceLogsDrawerComponent } from './invoices-details/inbox-logs-drawer/inbox-logs-drawer.component';
import { MatSortModule } from '@angular/material/sort';

@NgModule({
  declarations: [
    InvoicesComponent,
    InvoicesDetailsComponent,
    NewInvoiceComponent,
    InvoiceAddTimesheetDrawerComponent,
  ],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    InvoicesRoutingModule,
    MatTableModule,
    MatDatepickerModule,
    MatInputModule,
    NgbAccordionModule,
    MatNativeDateModule,
    MatSelectModule,
    SharedModule,
    MatCheckboxModule,
    MatPaginatorModule,
    InlineSVGModule,
    NgbTooltipModule,
    MatAutocompleteModule,
    MatSortModule,
  ],
})
export class InvoicesModule {}
