import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { WorkOrderRoutingModule } from './work-order-routing.module';
import { WorkOrderComponent } from './work-order.component';
import { WorkOrderDetailsComponent } from './work-order-details/work-order-details.component';
import { NewWorkOrderComponent } from './new-work-order/new-work-order.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { InlineSVGModule } from 'ng-inline-svg-2';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatTableModule } from '@angular/material/table';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { NewTaskDrawerComponent } from './work-order-details/new-task-drawer/new-task-drawer.component';
import { SharedModule } from '../../shared.modules';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatInputModule } from '@angular/material/input';

import { MatTabsModule } from '@angular/material/tabs';
import { CKEditorModule } from '@ckeditor/ckeditor5-angular';
import { WorkOrderNewTaskDrawerComponent } from './new-work-order/work-order-new-task-drawer/work-order-new-task-drawer.component';
import { MatSelectModule } from '@angular/material/select';
import { MatDialogModule } from '@angular/material/dialog';
import { ModalsModule } from 'src/app/_metronic/partials';
import { NgxDocViewerModule } from 'ngx-doc-viewer';
import { EditWorkDrawerComponent } from './work-order-details/edit-work-drawer/edit-work-drawer.component';


@NgModule({
  declarations: [
    WorkOrderComponent,
    WorkOrderDetailsComponent,
    NewWorkOrderComponent,
    NewTaskDrawerComponent,
    WorkOrderNewTaskDrawerComponent,
    EditWorkDrawerComponent,


  ],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    WorkOrderRoutingModule,
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
    MatDialogModule,
    ModalsModule,
    NgxDocViewerModule
  ],
  providers: [  
    MatDatepickerModule,  
    MatNativeDateModule
  ],
})
export class WorkOrderModule { }
