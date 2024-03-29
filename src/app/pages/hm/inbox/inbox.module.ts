import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';


import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { InlineSVGModule } from 'ng-inline-svg-2';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatTableModule } from '@angular/material/table';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { SharedModule } from '../../shared.modules';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatInputModule } from '@angular/material/input';

import { MatTabsModule } from '@angular/material/tabs';
import { CKEditorModule } from '@ckeditor/ckeditor5-angular';
import { MatSelectModule } from '@angular/material/select';
import { MatDialogModule } from '@angular/material/dialog';




import { InboxRoutingModule } from './inbox-routing.module';
import { InboxComponent } from './inbox.component';
import { WorkOrdersComponent } from './work-orders/work-orders.component';
import { TimesheetsComponent } from './timesheets/timesheets.component';
import { InvoicesComponent } from './invoices/invoices.component';
import { InvoicesDetailsComponent } from './invoices-details/invoices-details.component';
import { TimesheetsDetailsComponent } from './timesheets-details/timesheets-details.component';
import { WorkOrdersDetailsComponent } from './work-orders-details/work-orders-details.component';
import { InboxNewTaskDrawerComponent } from './work-orders-details/inbox-new-task-drawer/inbox-new-task-drawer.component';

import { NgbAccordionModule } from '@ng-bootstrap/ng-bootstrap';
import { InboxLogsDrawerComponent } from '../../inbox-drawer/inbox-logs-drawer/inbox-logs-drawer.component';
import { InboxAttachmentLogsDrawerComponent } from '../../inbox-drawer/inbox-attachment-logs-drawer/inbox-attachment-logs-drawer.component';
import { InboxCollaborateDrawerComponent } from '../../inbox-drawer/inbox-collaborate-drawer/inbox-collaborate-drawer.component';
import { InboxRejectDrawerComponent } from '../../inbox-drawer/inbox-reject-drawer/inbox-reject-drawer.component';
import { InboxApproveDrawerComponent } from '../../inbox-drawer/inbox-approve-drawer/inbox-approve-drawer.component';


@NgModule({
  declarations: [
    InboxComponent,
    WorkOrdersComponent,
    TimesheetsComponent,
    InvoicesComponent,  
    InvoicesDetailsComponent,
    TimesheetsDetailsComponent,
    WorkOrdersDetailsComponent,
    InboxNewTaskDrawerComponent,

    // InboxLogsDrawerComponent,
    // InboxAttachmentLogsDrawerComponent,
    // InboxCollaborateDrawerComponent,
    // InboxRejectDrawerComponent,
    // InboxApproveDrawerComponent,

  ],
  imports: [
    CommonModule,
    InboxRoutingModule,
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    SharedModule,
    CKEditorModule,
    InlineSVGModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatTableModule,
    NgbAccordionModule,
    MatCheckboxModule,
    MatTableModule,
    MatPaginatorModule,
    MatInputModule,
    MatNativeDateModule,
    MatTabsModule,
    MatSelectModule,
    MatDialogModule
  ],
  schemas: [
    CUSTOM_ELEMENTS_SCHEMA
  ],
})
export class InboxModule { }
