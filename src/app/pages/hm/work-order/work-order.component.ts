import { AfterViewInit, ChangeDetectorRef, Component, OnInit, ViewChild } from '@angular/core';
import { MatPaginator, PageEvent } from '@angular/material/paginator';
import { MatSnackBar } from '@angular/material/snack-bar';
import {MatTableDataSource, MatTableModule} from '@angular/material/table';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { catchError } from 'rxjs/internal/operators/catchError';
import EndPoints from 'src/app/common/endpoints';
import { ApiCallsService } from 'src/app/services/api-calls.service';
import { Utils } from 'src/app/services/utils';
import {MatSort, SortDirection} from '@angular/material/sort';
import {Sort} from '@angular/material/sort';

@Component({
  selector: 'app-work-order',
  templateUrl: './work-order.component.html',
  styleUrls: ['./work-order.component.scss']
})
export class WorkOrderComponent implements OnInit, AfterViewInit {

  constructor(private apiCalls: ApiCallsService,private utils: Utils, private snackBar: MatSnackBar, private cdr: ChangeDetectorRef,
      private router: Router, private route: ActivatedRoute) { }

  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;
  displayedColumns: string[] = ['workOrderId', 'type', 'title', 'jobPostId', 'priority', 'startDate', 'endDate', 'managerDetails', 'status'];
  dataSource = new MatTableDataSource<any>();
  loading= false;
  jobTypes: any[] = [];
  workOrderStatus: any[] = [];
  endPoints = EndPoints;
  isFromInbox = false;
  filterObj: FilterObj = {
    status: [],
    type: [],
    pageNo: 1,
    pageSize: 10
  }

  pageSize = this.filterObj.pageSize;
  currentPage = 0;
  totalWorkOrderCount = 0;

  filterValue: FilterValue = {
    type: 'All Types',
    status: 'All Status'
  } as FilterValue;

  ngOnInit(): void {
    this.route.queryParams.subscribe(param => {
      if(param['from'] == 'inbox'){
        this.isFromInbox = true;
      }else{
        this.isFromInbox = false;
      }
   


// console.log(param['pS'] )
// console.log(param['pN'] )

!param['pN'] ?this.filterObj.pageNo = 1 : this.filterObj.pageNo = param['pN'];
!param['pS']?this.filterObj.pageSize = 10 : this.filterObj.pageSize = param['pS'] ;
// console.log(this.filterObj )
this.getAllWorkOrders(this.filterObj);
    });

    // this.filterObj.pageNo = 1;
    // this.filterObj.pageSize = 10;
    this.getJobTypes();
    this.getWorkOrderStatus();
    this.getWorkOrderCount();

  }

  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
    // this.dataSource.sort = this.sort;
  }

  onPageChange(event: PageEvent) {
    this.currentPage = event.pageIndex;
    this.pageSize = event.pageSize;
    this.filterObj.pageNo = event.pageIndex + 1;
    this.filterObj.pageSize = event.pageSize;
    this.getAllWorkOrders(this.filterObj);
    // console.log( this.filterObj.pageNo)
    // console.log(  this.filterObj.pageSize)

    const pagenatorInfo:Params = {pS: this.filterObj.pageSize ,pN: this.filterObj.pageNo } 

    this.router.navigate(
      [],
      {
        relativeTo:this.route,
        queryParams: pagenatorInfo
      })
  }
  sortData(sort: any) {
    const data = this.dataSource.data

    if (!sort.active || sort.direction === '') {
      this.dataSource.data = data;
    } else {
      this.dataSource.data = data.sort((a, b) => {
        const aValue = (a as any)[sort.active];
        const bValue = (b as any)[sort.active];
        return (aValue < bValue ? -1 : 1) * (sort.direction === 'asc' ? 1 : -1);
      });
    }
    setTimeout(() => {
      this.paginator.pageIndex = this.filterObj.pageNo - 1;
      this.paginator.length = this.totalWorkOrderCount;
    });
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

  getAllWorkOrders(filterObj?: any){
    this.loading = true;
    const endPoint = this.isFromInbox ? this.endPoints.WORKORDER_NOTIFICATION : this.endPoints.ALL_WORK_ORDERS;
    this.apiCalls.get(endPoint, filterObj)
      .pipe(
        catchError(async (err) => {
          this.utils.showSnackBarMessage(this.snackBar, 'failed to fetch the work orders');
          this.loading = false;
          this.cdr.detectChanges();
          throw err;
        })
      )
      .subscribe((response) => {
        console.log(filterObj);
        
        // this.dataSource = new MatTableDataSource<any>(response);
        this.dataSource = new MatTableDataSource(response)
        this.dataSource.paginator = this.paginator;
        this.dataSource.sort = this.sort;

        setTimeout(() => {
          this.paginator.pageIndex = this.filterObj.pageNo - 1;
          this.paginator.length = this.totalWorkOrderCount;
        });

     

        this.loading = false;
        this.cdr.detectChanges();
   
      });
  }

  

  applySearchFilter(event: any){
    if(event.target.value){
      this.filterObj.workOrderId = event.target.value;
      this.getAllWorkOrders(this.filterObj);
    }else{
      this.clearSearch('workOrderId');
    }
  }

  getWorkOrderCount() {
    // this.isLoading = true;
    this.apiCalls
      .get(this.endPoints.ALL_WORK_ORDERS_COUNT)
      .pipe(
        catchError(async (err) => {
          this.utils.showSnackBarMessage(
            this.snackBar,
            'failed to get the job counts'
          );
          // this.isLoading = false;
          this.cdr.detectChanges();
          throw err;
        })
      )
      .subscribe((response) => {
        console.log('response', response)
        // this.jobCount = response;
        this.totalWorkOrderCount = response
        this.cdr.detectChanges();
      });
  }



  numbersOnly(event: any){
    return this.utils.numberOnly(event);
  }

  filterByManager(event: any){
    if(event.target.value && event.target.value.length >= 3){
      this.filterObj.searchByManager = event.target.value;
      this.getAllWorkOrders(this.filterObj);
    }else{
      this.clearSearch('searchByManager');
    }
  }

  filterByType(event: any){
    if(event.value == 'All Types'){
      this.filterObj.type = [];
    }else{
      this.filterObj.type = event.value;
    }
    this.getAllWorkOrders(this.filterObj);
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
    this.getAllWorkOrders();
  }

  clearSearch(val: keyof FilterObj) {
    delete this.filterObj[val];
    this.getAllWorkOrders();
  }

  truncateText(text: string, maxLength: number): string {
    if (!text) return '';
    let truncateText =  text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
    const div = document.createElement('div');
    div.innerHTML = truncateText;
    return div.textContent || div.innerText || '';
  }
  
  goToDetails(element: any){
    const queryParams = this.isFromInbox ? 
    { workOrderId: element.workOrderId, from: 'inbox', } : 
    { workOrderId: element.workOrderId,};
    this.router.navigate(['/hm/work-order/details'], { queryParams})
  } 

}

type FilterValue = {
  status?: string,
  workOrderId?: string,
  searchByManager?: string,
  startDate?: string,
  endDate?: string,
  type?: string
};

type FilterObj = {
  status?: string[];
  workOrderId?: string;
  searchByManager?: string;
  type?: string[];
  startDate?: string;
  endDate?:string;
  pageNo:number;
  pageSize:number;
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