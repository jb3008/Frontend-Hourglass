import { Component, OnInit, ViewChild } from '@angular/core';
import {MatPaginator} from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import {MatTableDataSource} from '@angular/material/table';

@Component({
  selector: 'app-timesheets',
  templateUrl: './timesheets.component.html',
  styleUrls: ['./timesheets.component.scss']
})
export class TimesheetsComponent implements OnInit {

  constructor() { }

  displayedColumns: string[] = ['timesheet', 'employee', 'workOrder', 'fromDate','dueDate', 'totalhr', 'status'];
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
  timesheet: number;
  employee: string;
  workOrder: number;
  fromDate: string;
  dueDate: string;
  totalhr: string;
  status: string;

}

const ELEMENT_DATA: PeriodicElement[] = [
  {timesheet: 2786111763, employee: 'Wade Warren', workOrder:2786111763, fromDate:'May 30, 2023', dueDate: 'May 30, 2023',totalhr: '16.0 (hr)', status: 'In-Progress'},
  {timesheet: 2786111763, employee: 'Wade Warren', workOrder:2786111763, fromDate:'May 30, 2023', dueDate: 'May 30, 2023',totalhr: '16.0 (hr)', status: 'In-Progress'},
  {timesheet: 2786111763, employee: 'Wade Warren', workOrder:2786111763, fromDate:'May 30, 2023', dueDate: 'May 30, 2023',totalhr: '16.0 (hr)', status: 'Approved'},
  {timesheet: 2786111763, employee: 'Wade Warren', workOrder:2786111763, fromDate:'May 30, 2023', dueDate: 'May 30, 2023',totalhr: '16.0 (hr)', status: 'In-Progress'},
  {timesheet: 2786111763, employee: 'Wade Warren', workOrder:2786111763, fromDate:'May 30, 2023', dueDate: 'May 30, 2023',totalhr: '16.0 (hr)', status: 'In-Progress'},
  {timesheet: 2786111763, employee: 'Wade Warren', workOrder:2786111763, fromDate:'May 30, 2023', dueDate: 'May 30, 2023',totalhr: '16.0 (hr)', status: 'Approved'},
  {timesheet: 2786111763, employee: 'Wade Warren', workOrder:2786111763, fromDate:'May 30, 2023', dueDate: 'May 30, 2023',totalhr: '16.0 (hr)', status: 'In-Progress'},
  {timesheet: 2786111763, employee: 'Wade Warren', workOrder:2786111763, fromDate:'May 30, 2023', dueDate: 'May 30, 2023',totalhr: '16.0 (hr)', status: 'Rejected'},
  {timesheet: 2786111763, employee: 'Wade Warren', workOrder:2786111763, fromDate:'May 30, 2023', dueDate: 'May 30, 2023',totalhr: '16.0 (hr)', status: 'In-Progress'},
  {timesheet: 2786111763, employee: 'Wade Warren', workOrder:2786111763, fromDate:'May 30, 2023', dueDate: 'May 30, 2023',totalhr: '16.0 (hr)', status: 'Rejected'},
  {timesheet: 2786111763, employee: 'Wade Warren', workOrder:2786111763, fromDate:'May 30, 2023', dueDate: 'May 30, 2023',totalhr: '16.0 (hr)', status: 'In-Progress'},
  {timesheet: 2786111763, employee: 'Wade Warren', workOrder:2786111763, fromDate:'May 30, 2023', dueDate: 'May 30, 2023',totalhr: '16.0 (hr)', status: 'In-Progress'},
  {timesheet: 2786111763, employee: 'Wade Warren', workOrder:2786111763, fromDate:'May 30, 2023', dueDate: 'May 30, 2023',totalhr: '16.0 (hr)', status: 'In-Progress'},
  {timesheet: 2786111763, employee: 'Wade Warren', workOrder:2786111763, fromDate:'May 30, 2023', dueDate: 'May 30, 2023',totalhr: '16.0 (hr)', status: 'In-Progress'},
  {timesheet: 2786111763, employee: 'Wade Warren', workOrder:2786111763, fromDate:'May 30, 2023', dueDate: 'May 30, 2023',totalhr: '16.0 (hr)', status: 'In-Progress'},
  
];