import { Component, OnInit } from '@angular/core';
import {MatTableDataSource, MatTableModule} from '@angular/material/table';

@Component({
  selector: 'app-work-order',
  templateUrl: './work-order.component.html',
  styleUrls: ['./work-order.component.scss']
})
export class WorkOrderComponent implements OnInit {

  constructor() { }

  ngOnInit(): void {
  }

  displayedColumns: string[] = ['workOrder', 'type', 'title', 'jobPost','priority', 'fDate', 'tDate', 'manager', 'status'];
  dataSource = new MatTableDataSource<PeriodicElement>(ELEMENT_DATA);

}




export interface PeriodicElement {
  workOrder: number;
  type: string;
  title: string;
  jobPost: number;
  priority: string;
  fDate: string;
  tDate: string;
  manager: string;
  status: string;

}

const ELEMENT_DATA: PeriodicElement[] = [
  {workOrder: 2786111763, type: 'WO Type 1', title:' A Sample Work Order', jobPost:2786111763, priority: 'High', fDate: 'May 30, 2023',tDate: 'May 30, 2023',manager:'Wade Warren', status: 'In-progress'},
  {workOrder: 2786111763, type: 'WO Type 1', title:' A Sample Work Order', jobPost:2786111763, priority: 'Medium', fDate: 'May 30, 2023',tDate: 'May 30, 2023',manager:'Wade Warren', status: 'In-progress'},
  {workOrder: 2786111763, type: 'WO Type 1', title:' A Sample Work Order', jobPost:2786111763, priority: 'Low', fDate: 'May 30, 2023',tDate: 'May 30, 2023',manager:'Wade Warren', status: 'In-progress'},
  {workOrder: 2786111763, type: 'WO Type 1', title:' A Sample Work Order', jobPost:2786111763, priority: 'Low', fDate: 'May 30, 2023',tDate: 'May 30, 2023',manager:'Wade Warren', status: 'In-progress'},
  {workOrder: 2786111763, type: 'WO Type 1', title:' A Sample Work Order', jobPost:2786111763, priority: 'Low', fDate: 'May 30, 2023',tDate: 'May 30, 2023',manager:'Wade Warren', status: 'In-progress'},
  {workOrder: 2786111763, type: 'WO Type 1', title:' A Sample Work Order', jobPost:2786111763, priority: 'Low', fDate: 'May 30, 2023',tDate: 'May 30, 2023',manager:'Wade Warren', status: 'In-progress'},
  {workOrder: 2786111763, type: 'WO Type 1', title:' A Sample Work Order', jobPost:2786111763, priority: 'Low', fDate: 'May 30, 2023',tDate: 'May 30, 2023',manager:'Wade Warren', status: 'In-progress'},
  {workOrder: 2786111763, type: 'WO Type 1', title:' A Sample Work Order', jobPost:2786111763, priority: 'Low', fDate: 'May 30, 2023',tDate: 'May 30, 2023',manager:'Wade Warren', status: 'In-progress'},
  {workOrder: 2786111763, type: 'WO Type 1', title:' A Sample Work Order', jobPost:2786111763, priority: 'Low', fDate: 'May 30, 2023',tDate: 'May 30, 2023',manager:'Wade Warren', status: 'In-progress'},
  {workOrder: 2786111763, type: 'WO Type 1', title:' A Sample Work Order', jobPost:2786111763, priority: 'Low', fDate: 'May 30, 2023',tDate: 'May 30, 2023',manager:'Wade Warren', status: 'In-progress'},
  {workOrder: 2786111763, type: 'WO Type 1', title:' A Sample Work Order', jobPost:2786111763, priority: 'Low', fDate: 'May 30, 2023',tDate: 'May 30, 2023',manager:'Wade Warren', status: 'In-progress'},
  {workOrder: 2786111763, type: 'WO Type 1', title:' A Sample Work Order', jobPost:2786111763, priority: 'Low', fDate: 'May 30, 2023',tDate: 'May 30, 2023',manager:'Wade Warren', status: 'In-progress'},
  {workOrder: 2786111763, type: 'WO Type 1', title:' A Sample Work Order', jobPost:2786111763, priority: 'Low', fDate: 'May 30, 2023',tDate: 'May 30, 2023',manager:'Wade Warren', status: 'In-progress'},
  {workOrder: 2786111763, type: 'WO Type 1', title:' A Sample Work Order', jobPost:2786111763, priority: 'Low', fDate: 'May 30, 2023',tDate: 'May 30, 2023',manager:'Wade Warren', status: 'In-progress'},
  {workOrder: 2786111763, type: 'WO Type 1', title:' A Sample Work Order', jobPost:2786111763, priority: 'Low', fDate: 'May 30, 2023',tDate: 'May 30, 2023',manager:'Wade Warren', status: 'In-progress'},
  
];