import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';

import { WorkOrderRoutingModule } from './work-order-routing.module';
import { WorkOrderComponent } from './work-order.component';
import { WorkOrderDetailComponent } from './work-order-detail/work-order-detail.component';
import { InlineSVGModule } from 'ng-inline-svg-2';
import {MatDatepickerModule} from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';

import {MatTableModule} from '@angular/material/table';
import {MatCheckboxModule} from '@angular/material/checkbox';
import { AddInvoiceDrawerComponent } from './add-invoice-drawer/add-invoice-drawer.component';
import { TimesheetLogsComponent } from './timesheet-logs/timesheet-logs.component';
import { NewTaskRecrDrawerComponent } from './work-order-detail/new-task-recr-drawer/new-task-recr-drawer.component';
import { SharedModule } from '../shared.modules';
import { MatSelectModule } from '@angular/material/select';
import { ModalsModule } from 'src/app/_metronic/partials';
import { NgxDocViewerModule } from 'ngx-doc-viewer';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatAutocompleteModule } from '@angular/material/autocomplete';


@NgModule({
  declarations: [
    WorkOrderComponent,
    WorkOrderDetailComponent,

    NewTaskRecrDrawerComponent,
    AddInvoiceDrawerComponent,
    TimesheetLogsComponent,

    
  ],
  imports: [
    CommonModule,
    FormsModule, 
    ReactiveFormsModule,
    WorkOrderRoutingModule,
    SharedModule,
    InlineSVGModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatTableModule,
    MatCheckboxModule,
    MatSelectModule,
    MatPaginatorModule,
    ModalsModule,
    NgxDocViewerModule,
    MatAutocompleteModule
  ],
  providers: [  
    MatDatepickerModule,  
    MatNativeDateModule
  ],
})
export class WorkOrderModule { }
