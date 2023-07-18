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


@NgModule({
  declarations: [
    InvoicesComponent,
    InvoicesDetailsComponent
  ],
  imports: [
    CommonModule,
    InvoicesRoutingModule,
    MatTableModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatInputModule,
    MatPaginatorModule,


  ]
})
export class InvoicesModule { }
