import { Component, OnInit, ViewChild } from '@angular/core';
import {MatPaginator} from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import {MatTableDataSource} from '@angular/material/table';

@Component({
  selector: 'app-work-orders',
  templateUrl: './work-orders.component.html',
  styleUrls: ['./work-orders.component.scss']
})
export class WorkOrdersComponent implements OnInit {

  constructor() { }

  displayedColumns: string[] = ['workorder', 'type', 'title', 'jobpost', 'priority',  'fromdate', 'todate', 'manager', 'status'];
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
  workorder: number;
  type: string;
  title: string;
  jobpost: number;
  priority: string;
  fromdate: string;
  todate: string;
  manager: string;
  status: string;

}

const ELEMENT_DATA: PeriodicElement[] = [
  {workorder: 2786111763, type:'WO Type 1',title:'A Sample work Order',jobpost:2786111763, priority:'High', fromdate:'May 30, 2023', todate:'May 30, 2023',manager: 'Wade Warren', status: 'In-Progress'},
  {workorder: 2786111763, type:'WO Type 1',title:'A Sample work Order',jobpost:2786111763, priority:'High', fromdate:'May 30, 2023', todate:'May 30, 2023',manager: 'Wade Warren', status: 'In-Progress'},
  {workorder: 2786111763, type:'WO Type 1',title:'A Sample work Order',jobpost:2786111763, priority:'High', fromdate:'May 30, 2023', todate:'May 30, 2023',manager: 'Wade Warren', status: 'In-Progress'},
  {workorder: 2786111763, type:'WO Type 1',title:'A Sample work Order',jobpost:2786111763, priority:'High', fromdate:'May 30, 2023', todate:'May 30, 2023',manager: 'Wade Warren', status: 'In-Progress'},
  {workorder: 2786111763, type:'WO Type 1',title:'A Sample work Order',jobpost:2786111763, priority:'High', fromdate:'May 30, 2023', todate:'May 30, 2023',manager: 'Wade Warren', status: 'In-Progress'},
  {workorder: 2786111763, type:'WO Type 1',title:'A Sample work Order',jobpost:2786111763, priority:'High', fromdate:'May 30, 2023', todate:'May 30, 2023',manager: 'Wade Warren', status: 'In-Progress'},
  {workorder: 2786111763, type:'WO Type 1',title:'A Sample work Order',jobpost:2786111763, priority:'High', fromdate:'May 30, 2023', todate:'May 30, 2023',manager: 'Wade Warren', status: 'In-Progress'},
  {workorder: 2786111763, type:'WO Type 1',title:'A Sample work Order',jobpost:2786111763, priority:'High', fromdate:'May 30, 2023', todate:'May 30, 2023',manager: 'Wade Warren', status: 'In-Progress'},
  {workorder: 2786111763, type:'WO Type 1',title:'A Sample work Order',jobpost:2786111763, priority:'High', fromdate:'May 30, 2023', todate:'May 30, 2023',manager: 'Wade Warren', status: 'In-Progress'},
  {workorder: 2786111763, type:'WO Type 1',title:'A Sample work Order',jobpost:2786111763, priority:'High', fromdate:'May 30, 2023', todate:'May 30, 2023',manager: 'Wade Warren', status: 'In-Progress'},
  {workorder: 2786111763, type:'WO Type 1',title:'A Sample work Order',jobpost:2786111763, priority:'High', fromdate:'May 30, 2023', todate:'May 30, 2023',manager: 'Wade Warren', status: 'In-Progress'},
  {workorder: 2786111763, type:'WO Type 1',title:'A Sample work Order',jobpost:2786111763, priority:'High', fromdate:'May 30, 2023', todate:'May 30, 2023',manager: 'Wade Warren', status: 'In-Progress'},
  {workorder: 2786111763, type:'WO Type 1',title:'A Sample work Order',jobpost:2786111763, priority:'High', fromdate:'May 30, 2023', todate:'May 30, 2023',manager: 'Wade Warren', status: 'In-Progress'},
  {workorder: 2786111763, type:'WO Type 1',title:'A Sample work Order',jobpost:2786111763, priority:'High', fromdate:'May 30, 2023', todate:'May 30, 2023',manager: 'Wade Warren', status: 'In-Progress'},
  {workorder: 2786111763, type:'WO Type 1',title:'A Sample work Order',jobpost:2786111763, priority:'High', fromdate:'May 30, 2023', todate:'May 30, 2023',manager: 'Wade Warren', status: 'In-Progress'},
  {workorder: 2786111763, type:'WO Type 1',title:'A Sample work Order',jobpost:2786111763, priority:'High', fromdate:'May 30, 2023', todate:'May 30, 2023',manager: 'Wade Warren', status: 'In-Progress'},
  {workorder: 2786111763, type:'WO Type 1',title:'A Sample work Order',jobpost:2786111763, priority:'High', fromdate:'May 30, 2023', todate:'May 30, 2023',manager: 'Wade Warren', status: 'In-Progress'},
  {workorder: 2786111763, type:'WO Type 1',title:'A Sample work Order',jobpost:2786111763, priority:'High', fromdate:'May 30, 2023', todate:'May 30, 2023',manager: 'Wade Warren', status: 'In-Progress'},
  {workorder: 2786111763, type:'WO Type 1',title:'A Sample work Order',jobpost:2786111763, priority:'High', fromdate:'May 30, 2023', todate:'May 30, 2023',manager: 'Wade Warren', status: 'In-Progress'},
 
  
  
];