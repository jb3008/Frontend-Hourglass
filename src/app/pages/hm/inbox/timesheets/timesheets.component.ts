import { Component, OnInit, ViewChild } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';

@Component({
  selector: 'app-timesheets',
  templateUrl: './timesheets.component.html',
  styleUrls: ['./timesheets.component.scss'],
})
export class TimesheetsComponent implements OnInit {
  constructor() {}

  displayedColumns: string[] = [
    'timeSheetId',
    'employee',
    'workOrderId',
    'fromDate',
    'toDate',
    'timeSpent',
    'status',
  ];
  dataSource = new MatTableDataSource<PeriodicElement>([]);

  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;

  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }
  ngOnInit(): void {
    console.log('CALLED');
  }
}

export interface PeriodicElement {
  timesheet: number;
  employee: string;
  workorder: number;
  fromdate: string;
  todate: string;
  workhr: string;
  status: string;
}

const ELEMENT_DATA: PeriodicElement[] = [
  {
    timesheet: 2786111763,
    employee: 'Wade Warren',
    workorder: 2786111763,
    fromdate: 'May 30, 2023',
    todate: 'May 30, 2023',
    workhr: '16.0 (hr)',
    status: 'In-Progress',
  },
  {
    timesheet: 2786111763,
    employee: 'Wade Warren',
    workorder: 2786111763,
    fromdate: 'May 30, 2023',
    todate: 'May 30, 2023',
    workhr: '16.0 (hr)',
    status: 'In-Progress',
  },
  {
    timesheet: 2786111763,
    employee: 'Wade Warren',
    workorder: 2786111763,
    fromdate: 'May 30, 2023',
    todate: 'May 30, 2023',
    workhr: '16.0 (hr)',
    status: 'In-Progress',
  },
  {
    timesheet: 2786111763,
    employee: 'Wade Warren',
    workorder: 2786111763,
    fromdate: 'May 30, 2023',
    todate: 'May 30, 2023',
    workhr: '16.0 (hr)',
    status: 'In-Progress',
  },
  {
    timesheet: 2786111763,
    employee: 'Wade Warren',
    workorder: 2786111763,
    fromdate: 'May 30, 2023',
    todate: 'May 30, 2023',
    workhr: '16.0 (hr)',
    status: 'In-Progress',
  },
  {
    timesheet: 2786111763,
    employee: 'Wade Warren',
    workorder: 2786111763,
    fromdate: 'May 30, 2023',
    todate: 'May 30, 2023',
    workhr: '16.0 (hr)',
    status: 'In-Progress',
  },
  {
    timesheet: 2786111763,
    employee: 'Wade Warren',
    workorder: 2786111763,
    fromdate: 'May 30, 2023',
    todate: 'May 30, 2023',
    workhr: '16.0 (hr)',
    status: 'In-Progress',
  },
  {
    timesheet: 2786111763,
    employee: 'Wade Warren',
    workorder: 2786111763,
    fromdate: 'May 30, 2023',
    todate: 'May 30, 2023',
    workhr: '16.0 (hr)',
    status: 'In-Progress',
  },
  {
    timesheet: 2786111763,
    employee: 'Wade Warren',
    workorder: 2786111763,
    fromdate: 'May 30, 2023',
    todate: 'May 30, 2023',
    workhr: '16.0 (hr)',
    status: 'In-Progress',
  },
  {
    timesheet: 2786111763,
    employee: 'Wade Warren',
    workorder: 2786111763,
    fromdate: 'May 30, 2023',
    todate: 'May 30, 2023',
    workhr: '16.0 (hr)',
    status: 'In-Progress',
  },
  {
    timesheet: 2786111763,
    employee: 'Wade Warren',
    workorder: 2786111763,
    fromdate: 'May 30, 2023',
    todate: 'May 30, 2023',
    workhr: '16.0 (hr)',
    status: 'In-Progress',
  },
  {
    timesheet: 2786111763,
    employee: 'Wade Warren',
    workorder: 2786111763,
    fromdate: 'May 30, 2023',
    todate: 'May 30, 2023',
    workhr: '16.0 (hr)',
    status: 'In-Progress',
  },
  {
    timesheet: 2786111763,
    employee: 'Wade Warren',
    workorder: 2786111763,
    fromdate: 'May 30, 2023',
    todate: 'May 30, 2023',
    workhr: '16.0 (hr)',
    status: 'In-Progress',
  },
  {
    timesheet: 2786111763,
    employee: 'Wade Warren',
    workorder: 2786111763,
    fromdate: 'May 30, 2023',
    todate: 'May 30, 2023',
    workhr: '16.0 (hr)',
    status: 'In-Progress',
  },
  {
    timesheet: 2786111763,
    employee: 'Wade Warren',
    workorder: 2786111763,
    fromdate: 'May 30, 2023',
    todate: 'May 30, 2023',
    workhr: '16.0 (hr)',
    status: 'In-Progress',
  },
  {
    timesheet: 2786111763,
    employee: 'Wade Warren',
    workorder: 2786111763,
    fromdate: 'May 30, 2023',
    todate: 'May 30, 2023',
    workhr: '16.0 (hr)',
    status: 'In-Progress',
  },
  {
    timesheet: 2786111763,
    employee: 'Wade Warren',
    workorder: 2786111763,
    fromdate: 'May 30, 2023',
    todate: 'May 30, 2023',
    workhr: '16.0 (hr)',
    status: 'In-Progress',
  },
  {
    timesheet: 2786111763,
    employee: 'Wade Warren',
    workorder: 2786111763,
    fromdate: 'May 30, 2023',
    todate: 'May 30, 2023',
    workhr: '16.0 (hr)',
    status: 'In-Progress',
  },
];
