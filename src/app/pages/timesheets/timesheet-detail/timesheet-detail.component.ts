import { AfterViewInit, Component, OnInit, } from '@angular/core';
import { NgbAccordionModule } from '@ng-bootstrap/ng-bootstrap';
import {MatTableDataSource, MatTableModule} from '@angular/material/table';
import { DrawerComponent } from 'src/app/_metronic/kt/components';

@Component({
  selector: 'app-timesheet-detail',
  templateUrl: './timesheet-detail.component.html',
  styleUrls: ['./timesheet-detail.component.scss']
})
export class TimesheetDetailComponent implements OnInit,AfterViewInit {

  constructor() { }

  ngOnInit(): void {
    // DrawerComponent.reinitialization();

  }

  ngAfterViewInit() {
    // setTimeout(() => {
      // console.log(   DrawerComponent.getInstance('kt_logs_drawer_toggle'))
      // DrawerComponent.hideAll();
      // DrawerComponent.updateAll()
      DrawerComponent.reinitialization();
    // }, 0); 

  }
 

  displayedColumns: string[] = ['taskId', 'taskName', 'priority', 'timeSpent',  'eta', 'lastUpdate', 'status',];
  dataSource = new MatTableDataSource<PeriodicElement>(ELEMENT_DATA);

}



export interface PeriodicElement {
  taskId: number;
  taskName: string;
  priority: string;
  // assignTo: string;
  timeSpent: string;
  eta: string;
  lastUpdate: string;
  status: string;

}

const ELEMENT_DATA: PeriodicElement[] = [
  {taskId: 8865, taskName: 'Some task name that has lengthy characters', priority:'High', timeSpent: '38 hrs', eta: '28/5/2023', lastUpdate: '28/5/2023', status: 'In-progress'},
  {taskId: 8865, taskName: 'Some task name that has lengthy characters', priority:'Medium', timeSpent: '38 hrs', eta: '28/5/2023', lastUpdate: '28/5/2023', status: 'In-progress'},
  {taskId: 8865, taskName: 'Some task name that has lengthy characters', priority:'Low', timeSpent: '38 hrs', eta: '28/5/2023', lastUpdate: '28/5/2023', status: 'In-progress'},
  {taskId: 8865, taskName: 'Some task name that has lengthy characters', priority:'Medium', timeSpent: '38 hrs', eta: '28/5/2023', lastUpdate: '28/5/2023', status: 'In-progress'},
  {taskId: 8865, taskName: 'Some task name that has lengthy characters', priority:'High', timeSpent: '38 hrs', eta: '28/5/2023', lastUpdate: '28/5/2023', status: 'In-progress'},
  // {taskId: 8865, taskName: 'Some task name that has lengthy characters', priority:'Medium', timeSpent: '38 hrs', eta: '28/5/2023', lastUpdate: '28/5/2023', status: 'In-progress'},
  // {taskId: 8865, taskName: 'Some task name that has lengthy characters', priority:'Low', timeSpent: '38 hrs', eta: '28/5/2023', lastUpdate: '28/5/2023', status: 'In-progress'},
  // {taskId: 8865, taskName: 'Some task name that has lengthy characters', priority:'High', timeSpent: '38 hrs', eta: '28/5/2023', lastUpdate: '28/5/2023', status: 'In-progress'},
  // {taskId: 8865, taskName: 'Some task name that has lengthy characters', priority:'Low', timeSpent: '38 hrs', eta: '28/5/2023', lastUpdate: '28/5/2023', status: 'In-progress'},

];