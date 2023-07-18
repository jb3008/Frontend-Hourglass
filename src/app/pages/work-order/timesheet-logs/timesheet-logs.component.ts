import { Component, OnInit } from '@angular/core';
import {MatTableDataSource, MatTableModule} from '@angular/material/table';

@Component({
  selector: 'app-timesheet-logs',
  templateUrl: './timesheet-logs.component.html',
  styleUrls: ['./timesheet-logs.component.scss']
})
export class TimesheetLogsComponent implements OnInit {
  displayedColumns: string[] = ['taskId', 'taskName',  'eta','timeSpentTillDate', 'timeSpent','progression', 'dueDate', 'status', 'log'];
  dataSource = new MatTableDataSource<PeriodicElement>(ELEMENT_DATA);


  constructor() { }

  ngOnInit(): void {
  }

}




export interface PeriodicElement {
  taskId: number;
  taskName: string;
  eta: string;
  timeSpent: string;
  timeSpentTillDate: string;
  progression: string;
  dueDate: string;
  status: string;

}

const ELEMENT_DATA: PeriodicElement[] = [
  {taskId: 8865, taskName: 'Some task name that has lengthy characters', eta: '5 Days', timeSpent: '38 hr',timeSpentTillDate:'38 hr', progression: '40%', dueDate :'28/5/23', status: 'In-progress'},
  {taskId: 8865, taskName: 'Some task name that has lengthy characters', eta: '5 Days', timeSpent: '38 hr',timeSpentTillDate:'38 hr', progression: '50%', dueDate :'28/5/23', status: 'In-progress'},
  {taskId: 8865, taskName: 'Some task name that has lengthy characters', eta: '5 Days', timeSpent: '38 hr',timeSpentTillDate:'38 hr', progression: '30%', dueDate :'28/5/23', status: 'In-progress'},
  {taskId: 8865, taskName: 'Some task name that has lengthy characters', eta: '5 Days', timeSpent: '38 hr',timeSpentTillDate:'38 hr', progression: '40%', dueDate :'28/5/23', status: 'In-progress'},
  {taskId: 8865, taskName: 'Some task name that has lengthy characters', eta: '5 Days', timeSpent: '38 hr',timeSpentTillDate:'38 hr', progression: '20%', dueDate :'28/5/23', status: 'In-progress'},
  {taskId: 8865, taskName: 'Some task name that has lengthy characters', eta: '5 Days', timeSpent: '38 hr',timeSpentTillDate:'38 hr', progression: '20%', dueDate :'28/5/23', status: 'In-progress'},
  {taskId: 8865, taskName: 'Some task name that has lengthy characters', eta: '5 Days', timeSpent: '38 hr',timeSpentTillDate:'38 hr', progression: '20%', dueDate :'28/5/23', status: 'In-progress'},
  
];