import { ChangeDetectorRef, Component, OnInit, ViewChild } from '@angular/core';
import {MatTableDataSource, MatTableModule} from '@angular/material/table';
import {
  DrawerComponent,
  ToggleComponent,
} from '../../../_metronic/kt/components';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ActivatedRoute } from '@angular/router';
import { ApiCallsService } from 'src/app/services/api-calls.service';
import { Utils } from 'src/app/services/utils';
import EndPoints from 'src/app/common/endpoints';
import { catchError } from 'rxjs/internal/operators/catchError';
import { MatPaginator } from '@angular/material/paginator';

@Component({
  selector: 'app-work-order-detail',
  templateUrl: './work-order-detail.component.html',
  styleUrls: ['./work-order-detail.component.scss']
})
export class WorkOrderDetailComponent implements OnInit {

  constructor(private route: ActivatedRoute,private utils: Utils, private snackBar: MatSnackBar, private dialog: MatDialog, private apiCalls: ApiCallsService, private cdr: ChangeDetectorRef) { }

  endpoints = EndPoints;
  workOrderID: any;
  loading = false;
  workOrderDetails: any;
  documentsList: any[] = [];
  statusLists: any[] = [];
  taskDetails: any;
  timeSheetFrequencyList: any = {'W': 'Weekly', '2W': 'Bi-Weekly', 'M': 'Monthly'};
  displayedColumns: string[] = ['taskId', 'title', 'priority', 'assigneeId','timeSpent',  'finishDate', 'lastUpdate', 'status', 'action'];
  dataSource = new MatTableDataSource<any>;
  @ViewChild(MatPaginator) paginator: MatPaginator;
  
  filterObj: FilterObj = {}

  filterValue: FilterValue = {
    priority: 'All Priorities',
    status: 'All Status'
  } as FilterValue;

  ngOnInit(): void {
    this.route.queryParams.subscribe(param => {
      this.workOrderID = param['workOrderId'];
    });
    this.getWorkOrderDetails();
    this.getAllStatus();
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
        this.filterObj.workOrderId = this.workOrderDetails.workOrderId
        this.loading = false;
        this.cdr.detectChanges();
      });
  }

  getAllStatus(){
    this.apiCalls.get(this.endpoints.WORK_ORDER_STATUS)
    .pipe(
      catchError(async (err) => {
        this.utils.showSnackBarMessage(this.snackBar, 'failed to fetch the work order status');
        throw err;
      })
    )
    .subscribe((response) => {
      this.statusLists = response;
      this.cdr.detectChanges();
    });
  }

  getTaskList(obj: any){
    this.loading = true;
    this.apiCalls.get(this.endpoints.TASK_LIST_HM, obj)
      .pipe(
        catchError(async (err) => {
          this.utils.showSnackBarMessage(this.snackBar, 'failed to get the task list');
          this.loading = false;
          this.cdr.detectChanges();
          throw err;
        })
      )
      .subscribe((response) => {
        this.dataSource = new MatTableDataSource<any>(response);
        this.dataSource.paginator = this.paginator;
        this.loading = false;
        this.cdr.detectChanges();
      });
  }

  editTask(id: string){
    this.loading = true;
    let queryObj = {
      taskId: id
    }
    this.apiCalls.get(this.endpoints.TASK_LIST_HM, queryObj)
      .pipe(
        catchError(async (err) => {
          this.utils.showSnackBarMessage(this.snackBar, 'failed to get the task details');
          this.loading = false;
          this.cdr.detectChanges();
          throw err;
        })
      )
      .subscribe((response) => {
        this.taskDetails = response[0];
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

  applySearchFilter(event: any){
    if(event.target.value){
      this.filterObj.taskId = event.target.value;
      this.getTaskList(this.filterObj);
    }else{
      if (Object.keys(this.filterObj).length > 0) {
        delete this.filterObj.taskId;
        this.getTaskList(this.filterObj);
      } else {
        this.clearSearch('taskId');
      }
    }
  }

  clearSearch(val: keyof FilterObj) {
    delete this.filterObj[val];
    this.getTaskList(this.filterObj);
  }

  filterByPriority(event: any){
    if(event.value == 'All Priorities'){
      this.filterObj.priority = [];
    }else{
      this.filterObj.priority = event.value;
    }
    this.getTaskList(this.filterObj);
  }

  filterByAssignee(event: any){
    if(event.target.value && event.target.value.length >= 3){
      this.filterObj.assigneeId = event.target.value;
      this.getTaskList(this.filterObj);
    }else{
      if (Object.keys(this.filterObj).length > 0) {
        delete this.filterObj.assigneeId;
        this.getTaskList(this.filterObj);
      } else {
        this.clearSearch('assigneeId');
      }
    }
  }

  filterByStatus(event: any){
    if(event.value == 'All Status'){
      this.filterObj.status = [];
    }else{
      this.filterObj.status = event.value;
    }
    this.getTaskList(this.filterObj);
  }

  filterByDate(event: any, dateType: 'finishDate'){
    let date = this.changeDateToUtc(event);
    this.filterObj[dateType] = date;
    this.getTaskList(this.filterObj);
  }

  changeDateToUtc(dateObj: any){
    const date = new Date(dateObj);
    const utcDate = date.toISOString();
    return utcDate;
  }

  clearFilters(){
    delete this.filterObj.taskId;
    delete this.filterObj.assigneeId;
    delete this.filterObj.priority;
    delete this.filterObj.finishDate;
    this.filterObj.status = [];
    this.filterObj.priority = [];
    this.filterValue.status = 'All Status';
    this.filterValue.priority = 'All Priorities';
    this.filterValue.taskId = '';
    this.filterValue.assigneeId = '';
    this.filterValue.finishDate = '';
    this.getTaskList(this.filterObj);
  }

}

type FilterValue = {
  taskId?: string,
  priority?: string,
  assigneeId?: string,
  status?: string,
  finishDate?: string
};

type FilterObj = {
  workOrderId?: string,
  taskId?: string,
  priority?: string[],
  assigneeId?: string,
  status?: string[],
  finishDate?: string
};

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