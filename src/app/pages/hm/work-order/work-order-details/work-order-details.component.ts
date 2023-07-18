import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import {MatTableDataSource, MatTableModule} from '@angular/material/table';
import { ActivatedRoute } from '@angular/router';
import { catchError } from 'rxjs/internal/operators/catchError';
import { DrawerComponent } from 'src/app/_metronic/kt/components/_DrawerComponent';
import { ToggleComponent } from 'src/app/_metronic/kt/components/_ToggleComponent';
import EndPoints from 'src/app/common/endpoints';
import { ApiCallsService } from 'src/app/services/api-calls.service';
import { Utils } from 'src/app/services/utils';

@Component({
  selector: 'app-work-order-details',
  templateUrl: './work-order-details.component.html',
  styleUrls: ['./work-order-details.component.scss']
})
export class WorkOrderDetailsComponent implements OnInit {

  constructor(private route: ActivatedRoute,private utils: Utils, private snackBar: MatSnackBar, private apiCalls: ApiCallsService, private cdr: ChangeDetectorRef) { }

  endpoints = EndPoints;
  workOrderID: any;
  loading = false;
  workOrderDetails: any;
  documentsList: any[] = [];
  timeSheetFrequencyList: any = {'W': 'Weekly', '2W': 'Bi-Weekly', 'M': 'Monthly'};

  ngOnInit(): void {
    this.route.queryParams.subscribe(param => {
      this.workOrderID = param['workOrderId'];
    });
    this.getWorkOrderDetails();
  }

  isSelectedTab:string ='Details';
  getSelectedTab(tab:string): void {
    console.log(tab)
    this.isSelectedTab = tab
    

    setTimeout(() => {
      DrawerComponent.reinitialization();
      ToggleComponent.reinitialization();
    }, 0);

  }

  getWorkOrderDetails(){
    this.loading = true;
    let queryObj = {
      workOrderId: this.workOrderID
    }
    this.apiCalls.get(this.endpoints.ALL_WORK_ORDERS, queryObj)
      .pipe(
        catchError(async (err) => {
          this.utils.showSnackBarMessage(this.snackBar, 'failed to fetch the work order details');
          this.loading = false;
          throw err;
        })
      )
      .subscribe((response) => {
        this.workOrderDetails = response[0];
        this.loading = false;
        this.cdr.detectChanges();
      });
  }

  getDocuments(){
    this.loading = true;
    let queryObj = {
      id : this.workOrderID,
      attachmentType : 'WORK_ORDER'
    }
    this.apiCalls.get(this.endpoints.GET_DOCUMENTS, queryObj)
      .pipe(
        catchError(async (err) => {
          this.utils.showSnackBarMessage(this.snackBar, 'failed to fetch the documents');
          this.loading = false;
          throw err;
        })
      )
      .subscribe((response) => {
        this.documentsList = response;
        this.loading = false;
        this.cdr.detectChanges();
      });
  }
  
  downloadDoc(id:string){
    const url = `http://172.105.36.16:8080/hourglass/document/getAttachment?documentId=${id}`
    window.open(url, '_blank');
  }

  displayedColumns: string[] = ['taskId', 'taskName', 'priority', 'assignTo','timeSpent',  'eta', 'lastUpdate', 'status', 'action'];
  dataSource = new MatTableDataSource<PeriodicElement>(ELEMENT_DATA);


}


export interface PeriodicElement {
  taskId: number;
  taskName: string;
  priority: string;
  assignTo: string;
  timeSpent: string;
  eta: string;
  lastUpdate: string;
  status: string;

}

const ELEMENT_DATA: PeriodicElement[] = [
  {taskId: 8865, taskName: 'Some task name that has lengthy characters', priority:'High', assignTo:'Shirley Lopez', timeSpent: '38 hrs', eta: 'Jun 23, 2023', lastUpdate: 'Jun 23, 2023', status: 'In-progress'},
  {taskId: 8865, taskName: 'Some task name that has lengthy characters', priority:'Medium', assignTo:'Shirley Lopez', timeSpent: '38 hrs', eta: 'Jun 23, 2023', lastUpdate: 'Jun 23, 2023', status: 'In-progress'},
  {taskId: 8865, taskName: 'Some task name that has lengthy characters', priority:'Low', assignTo:'Shirley Lopez', timeSpent: '38 hrs', eta: 'Jun 23, 2023', lastUpdate: 'Jun 23, 2023', status: 'In-progress'},
  {taskId: 8865, taskName: 'Some task name that has lengthy characters', priority:'Medium', assignTo:'Shirley Lopez', timeSpent: '38 hrs', eta: 'Jun 23, 2023', lastUpdate: 'Jun 23, 2023', status: 'In-progress'},
  {taskId: 8865, taskName: 'Some task name that has lengthy characters', priority:'High', assignTo:'Shirley Lopez', timeSpent: '38 hrs', eta: 'Jun 23, 2023', lastUpdate: 'Jun 23, 2023', status: 'In-progress'},
  {taskId: 8865, taskName: 'Some task name that has lengthy characters', priority:'Medium', assignTo:'Shirley Lopez', timeSpent: '38 hrs', eta: 'Jun 23, 2023', lastUpdate: 'Jun 23, 2023', status: 'In-progress'},
  {taskId: 8865, taskName: 'Some task name that has lengthy characters', priority:'Low', assignTo:'Shirley Lopez', timeSpent: '38 hrs', eta: 'Jun 23, 2023', lastUpdate: 'Jun 23, 2023', status: 'In-progress'},
  {taskId: 8865, taskName: 'Some task name that has lengthy characters', priority:'High', assignTo:'Shirley Lopez', timeSpent: '38 hrs', eta: 'Jun 23, 2023', lastUpdate: 'Jun 23, 2023', status: 'In-progress'},
  {taskId: 8865, taskName: 'Some task name that has lengthy characters', priority:'Low', assignTo:'Shirley Lopez', timeSpent: '38 hrs', eta: 'Jun 23, 2023', lastUpdate: 'Jun 23, 2023', status: 'In-progress'},

];