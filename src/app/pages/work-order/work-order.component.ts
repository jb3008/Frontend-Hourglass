import { ChangeDetectorRef, Component, OnInit, ViewChild } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatSnackBar } from '@angular/material/snack-bar';
import {MatTableDataSource, MatTableModule} from '@angular/material/table';
import { Router } from '@angular/router';
import { catchError } from 'rxjs/internal/operators/catchError';
import EndPoints from 'src/app/common/endpoints';
import { ApiCallsService } from 'src/app/services/api-calls.service';
import { Utils } from 'src/app/services/utils';

@Component({
  selector: 'app-work-order',
  templateUrl: './work-order.component.html',
  styleUrls: ['./work-order.component.scss']
})
export class WorkOrderComponent implements OnInit {

  constructor(private apiCalls: ApiCallsService,private utils: Utils, private snackBar: MatSnackBar, private cdr: ChangeDetectorRef,
    private router: Router) { }

  @ViewChild(MatPaginator) paginator: MatPaginator;
  displayedColumns: string[] = ['workOrderId', 'type', 'title', 'jobPostId', 'priority', 'startDate', 'endDate', 'managerDetails', 'status'];
  dataSource = new MatTableDataSource<any>();
  loading= false;
  jobTypes: any[] = [];
  workOrderStatus: any[] = [];
  endPoints = EndPoints;
  filterObj: FilterObj = {
    vendorId: sessionStorage.getItem('vendorId')!,
    status: [],
    type: []
  }

  filterValue: FilterValue = {
    type: 'All Types',
    status: 'All Status'
  } as FilterValue;

  ngOnInit(): void {
    this.getJobTypes();
    this.getWorkOrderStatus();
    this.getAllWorkOrders(this.filterObj);
  }

  getJobTypes(){
    this.apiCalls.get(this.endPoints.JOB_TYPE)
    .pipe(
      catchError(async (err) => {
        this.utils.showSnackBarMessage(this.snackBar, 'failed to fetch the job types');
        throw err;
      })
    )
    .subscribe((response) => {
      this.jobTypes = response;
      this.cdr.detectChanges();
    });
  }

  getWorkOrderStatus(){
    this.apiCalls.get(this.endPoints.WORK_ORDER_STATUS)
    .pipe(
      catchError(async (err) => {
        this.utils.showSnackBarMessage(this.snackBar, 'failed to fetch the work order status');
        throw err;
      })
    )
    .subscribe((response) => {
      this.workOrderStatus = response;
      this.cdr.detectChanges();
    });
  }

  getAllWorkOrders(filterObj: any){
    this.loading = true;
    this.apiCalls.get(this.endPoints.ALL_WORK_ORDERS, filterObj)
      .pipe(
        catchError(async (err) => {
          this.utils.showSnackBarMessage(this.snackBar, 'failed to fetch the work orders');
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

  goToDetails(element: any){
    this.router.navigate(['/work-order/details'], {queryParams: {workOrderId: element.workOrderId}})
  }

  truncateText(text: string, maxLength: number): string {
    if (!text) return '';
    return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
  }

  applySearchFilter(event: any){
    if(event.target.value){
      this.filterObj.workOrderId = event.target.value;
      this.getAllWorkOrders(this.filterObj);
    }else{
      this.clearSearch('workOrderId');
    }
  }

  clearSearch(val: keyof FilterObj) {
    delete this.filterObj[val];
    this.getAllWorkOrders(this.filterObj);
  }

  filterByType(event: any){
    if(event.value == 'All Types'){
      this.filterObj.type = [];
    }else{
      this.filterObj.type = event.value;
    }
    this.getAllWorkOrders(this.filterObj);
  }

  filterByManager(event: any){
    if(event.target.value && event.target.value.length >= 3){
      this.filterObj.searchByManager = event.target.value;
      this.getAllWorkOrders(this.filterObj);
    }else{
      this.clearSearch('searchByManager');
    }
  }

  filterByStatus(event: any){
    if(event.value == 'All Status'){
      this.filterObj.status = [];
    }else{
      this.filterObj.status = event.value;
    }
    this.getAllWorkOrders(this.filterObj);
  }

  filterByDate(event: any, dateType: 'startDate' | 'endDate'){
    let date = this.changeDateToUtc(event);
    this.filterObj[dateType] = date;
    this.getAllWorkOrders(this.filterObj);
  }

  changeDateToUtc(dateObj: any){
    const date = new Date(dateObj);
    const utcDate = date.toISOString();
    return utcDate;
  }

  clearFilters(){
    delete this.filterObj.workOrderId;
    delete this.filterObj.searchByManager;
    delete this.filterObj.type;
    delete this.filterObj.startDate;
    delete this.filterObj.endDate;
    this.filterObj.status = [];
    this.filterObj.type = [];
    this.filterValue.status = 'All Status';
    this.filterValue.workOrderId = '';
    this.filterValue.searchByManager = '';
    this.filterValue.startDate = '';
    this.filterValue.endDate = '';
    this.filterValue.type = 'All Types';
    this.getAllWorkOrders(this.filterObj);
  }

}

type FilterObj = {
  vendorId: string,
  status?: string[];
  workOrderId?: string;
  searchByManager?: string;
  type?: string[];
  startDate?: string;
  endDate?:string;
};

type FilterValue = {
  status?: string,
  workOrderId?: string,
  searchByManager?: string,
  startDate?: string,
  endDate?: string,
  type?: string
};


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