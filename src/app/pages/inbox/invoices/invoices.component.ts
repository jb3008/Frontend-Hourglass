import { Component, OnInit, ViewChild } from '@angular/core';
import {MatPaginator} from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import {MatTableDataSource} from '@angular/material/table';

@Component({
  selector: 'app-invoices',
  templateUrl: './invoices.component.html',
  styleUrls: ['./invoices.component.scss']
})
export class InvoicesComponent implements OnInit {

  constructor() { }

  displayedColumns: string[] = ['invoice', 'invoiceDate', 'submittedby',  'amount', 'status'];
  dataSource = new MatTableDataSource<PeriodicElement>(ELEMENT_DATA);

  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;

  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }
  ngOnInit(): void {
  }

}



export interface PeriodicElement {
  invoice: number;
  invoiceDate: string;
  submittedby: string;
  amount: string;
  status: string;

}

const ELEMENT_DATA: PeriodicElement[] = [
  {invoice: 2786111763, submittedby: 'Wade Warren',invoiceDate:'May 30, 2023',amount: '1,240.00 USD', status: 'In-Progress'},
  {invoice: 2786111763, submittedby: 'Wade Warren',invoiceDate:'May 30, 2023',amount: '1,240.00 USD', status: 'Approved'},
  {invoice: 2786111763, submittedby: 'Wade Warren',invoiceDate:'May 30, 2023',amount: '1,240.00 USD', status: 'In-Progress'},
  {invoice: 2786111763, submittedby: 'Wade Warren',invoiceDate:'May 30, 2023',amount: '1,240.00 USD', status: 'Rejected'},
  {invoice: 2786111763, submittedby: 'Wade Warren',invoiceDate:'May 30, 2023',amount: '1,240.00 USD', status: 'In-Progress'},
  {invoice: 2786111763, submittedby: 'Wade Warren',invoiceDate:'May 30, 2023',amount: '1,240.00 USD', status: 'In-Progress'},
  {invoice: 2786111763, submittedby: 'Wade Warren',invoiceDate:'May 30, 2023',amount: '1,240.00 USD', status: 'In-Progress'},
  {invoice: 2786111763, submittedby: 'Wade Warren',invoiceDate:'May 30, 2023',amount: '1,240.00 USD', status: 'In-Progress'},
  {invoice: 2786111763, submittedby: 'Wade Warren',invoiceDate:'May 30, 2023',amount: '1,240.00 USD', status: 'In-Progress'},
  {invoice: 2786111763, submittedby: 'Wade Warren',invoiceDate:'May 30, 2023',amount: '1,240.00 USD', status: 'In-Progress'},
  {invoice: 2786111763, submittedby: 'Wade Warren',invoiceDate:'May 30, 2023',amount: '1,240.00 USD', status: 'In-Progress'},
  {invoice: 2786111763, submittedby: 'Wade Warren',invoiceDate:'May 30, 2023',amount: '1,240.00 USD', status: 'In-Progress'},
  {invoice: 2786111763, submittedby: 'Wade Warren',invoiceDate:'May 30, 2023',amount: '1,240.00 USD', status: 'In-Progress'},
  {invoice: 2786111763, submittedby: 'Wade Warren',invoiceDate:'May 30, 2023',amount: '1,240.00 USD', status: 'In-Progress'},
  {invoice: 2786111763, submittedby: 'Wade Warren',invoiceDate:'May 30, 2023',amount: '1,240.00 USD', status: 'In-Progress'},
  {invoice: 2786111763, submittedby: 'Wade Warren',invoiceDate:'May 30, 2023',amount: '1,240.00 USD', status: 'In-Progress'},
  {invoice: 2786111763, submittedby: 'Wade Warren',invoiceDate:'May 30, 2023',amount: '1,240.00 USD', status: 'In-Progress'},
  {invoice: 2786111763, submittedby: 'Wade Warren',invoiceDate:'May 30, 2023',amount: '1,240.00 USD', status: 'In-Progress'},
  {invoice: 2786111763, submittedby: 'Wade Warren',invoiceDate:'May 30, 2023',amount: '1,240.00 USD', status: 'In-Progress'},
  {invoice: 2786111763, submittedby: 'Wade Warren',invoiceDate:'May 30, 2023',amount: '1,240.00 USD', status: 'In-Progress'},
  {invoice: 2786111763, submittedby: 'Wade Warren',invoiceDate:'May 30, 2023',amount: '1,240.00 USD', status: 'In-Progress'},
  {invoice: 2786111763, submittedby: 'Wade Warren',invoiceDate:'May 30, 2023',amount: '1,240.00 USD', status: 'In-Progress'},
  {invoice: 2786111763, submittedby: 'Wade Warren',invoiceDate:'May 30, 2023',amount: '1,240.00 USD', status: 'In-Progress'},
  {invoice: 2786111763, submittedby: 'Wade Warren',invoiceDate:'May 30, 2023',amount: '1,240.00 USD', status: 'In-Progress'},
  {invoice: 2786111763, submittedby: 'Wade Warren',invoiceDate:'May 30, 2023',amount: '1,240.00 USD', status: 'In-Progress'},
  
  
];