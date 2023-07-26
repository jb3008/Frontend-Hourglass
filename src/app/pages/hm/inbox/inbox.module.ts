import { NgModule } from '@angular/core';
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


@NgModule({
  declarations: [
    InboxComponent,
    WorkOrdersComponent,
    TimesheetsComponent,
    InvoicesComponent
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
    MatCheckboxModule,
    MatTableModule,
    MatPaginatorModule,
    MatInputModule,
    MatNativeDateModule,
    MatTabsModule,
    MatSelectModule,
    MatDialogModule
  ]
})
export class InboxModule { }
