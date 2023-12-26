import { ChangeDetectorRef, Component, OnInit, ViewChild } from '@angular/core';
import { MatPaginator, PageEvent } from '@angular/material/paginator';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { catchError } from 'rxjs/internal/operators/catchError';
import EndPoints from 'src/app/common/endpoints';
import { ApiCallsService } from 'src/app/services/api-calls.service';
import { Utils } from 'src/app/services/utils';
import { MatSort, SortDirection } from '@angular/material/sort';
import { Sort } from '@angular/material/sort';
import { MatDialog } from '@angular/material/dialog';
import { NavbarComponent } from 'src/app/_metronic/layout/components/header/navbar/navbar.component';

@Component({
  selector: 'app-work-order',
  templateUrl: './work-order.component.html',
  styleUrls: ['./work-order.component.scss'],
})
export class WorkOrderComponent implements OnInit {
  constructor(
    private apiCalls: ApiCallsService,
    private utils: Utils,
    private snackBar: MatSnackBar,
    private cdr: ChangeDetectorRef,
    private router: Router,
    private dialog: MatDialog,
    private route: ActivatedRoute
  ) {}

  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;
  displayedColumns: string[] = [
    'workOrderId',
    'type',
    'title',
    'jobPostId',
    'priority',
    'startDate',
    'endDate',
    'managerDetails',
    'status',
  ];
  queryParamData: any = {};
  dataSource = new MatTableDataSource<any>();
  loading = false;
  apiLoad = false;
  isFromInbox = false;
  jobTypes: any[] = [];
  workOrderStatus: any[] = [];
  endPoints = EndPoints;
  filterObj: FilterObj = {
    vendorId: sessionStorage.getItem('vendorId')!,
    status: '',
    type: '',
    pageNo: 1,
    pageSize: 10,
    workOrderId: '',
    searchByManager: '',
    startDate: '',
    endDate: '',
  };
  auth: any;
  pageSize = 10;
  currentPage = 0;
  totalWorkOrderCount = 0;
  sortBy: string = 'workOrderId';
  sortOrder: string = 'desc';
  filterValue: FilterValue = {
    type: 'All Types',
    status: 'All Status',
  } as FilterValue;

  isSelectedTab: string = 'Inbox';
  flag: any = 'Inbox';
  changeFlag(flag: string) {
    if (flag === 'Inbox') {
      this.flag = 'Inbox';
      this.isSelectedTab = flag;
    } else {
      this.flag = 'Outbox';
      this.isSelectedTab = flag;
    }
    this.clearFilters();
  }

  ngOnInit(): void {
    console.log('??????????');
  }

  ngAfterViewInit() {
    this.apiLoad = false;
    this.auth = this.utils.getAuth();
    this.route.queryParams.subscribe((param) => {
      this.sort.sortChange.subscribe(() => {
        this.sortBy = this.sort.active;
        this.sortOrder = this.sort.direction;
        this.filterObj.pageNo = 1;
        this.filterObj.pageSize = 10;

        this.getAllWorkOrders(this.filterObj);
      });
      if (param['from'] == 'Inbox' || param['from'] == 'Outbox') {
        this.isFromInbox = true;
        this.flag = param['from'];
        this.isSelectedTab = this.flag;
      } else {
        this.isFromInbox = false;
      }

      this.filterObj.pageNo = param['pageNo']
        ? parseInt(param['pageNo'])
        : this.filterObj.pageNo;
      this.filterObj.pageSize = param['pageSize']
        ? parseInt(param['pageSize'])
        : this.filterObj.pageSize;
      this.filterObj.status = param['status']
        ? param['status']
        : this.filterObj.status;
      this.filterObj.type = param['type'] ? param['type'] : this.filterObj.type;

      this.filterObj.workOrderId = param['workOrderId']
        ? param['workOrderId']
        : this.filterObj.workOrderId;
      this.filterObj.startDate = param['startDate']
        ? this.changeDateToUtc(new Date(param['startDate']))
        : this.filterObj.startDate;
      this.filterObj.endDate = param['endDate']
        ? this.changeDateToUtc(new Date(param['endDate']))
        : this.filterObj.endDate;
      this.filterObj.endDate = param['searchByManager']
        ? param['searchByManager']
        : this.filterObj.searchByManager;

      this.sortBy = param['sortBy'] ? param['sortBy'] : 'workOrderId';
      this.sortOrder = param['sortOrder'] ? param['sortOrder'] : 'desc';
      this.sort.active = this.sortBy;
      this.sort.direction = this.sortOrder === 'desc' ? 'desc' : 'asc';

      this.getAllWorkOrders(this.filterObj);
    });
    this.getJobTypes();
    this.getWorkOrderStatus();
    // this.getWorkOrderCount();
  }

  onPageChange(event: PageEvent) {
    this.currentPage = event.pageIndex;
    this.pageSize = event.pageSize;
    this.filterObj.pageNo = event.pageIndex + 1;
    this.filterObj.pageSize = event.pageSize;
    this.getAllWorkOrders(this.filterObj);
  }
  sortData(sort: any) {
    const data = this.dataSource.data;
    console.log(location.search);
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

  getJobTypes() {
    this.apiCalls
      .get(this.endPoints.JOB_TYPE)
      .pipe(
        catchError(async (err) => {
          this.utils.showErrorDialog(this.dialog, err);
        })
      )
      .subscribe((response) => {
        this.jobTypes = response;
        this.cdr.detectChanges();
      });
  }

  numbersOnly(event: any) {
    return this.utils.numberOnly(event);
  }

  getWorkOrderStatus() {
    this.apiCalls
      .get(this.endPoints.WORK_ORDER_STATUS)
      .pipe(
        catchError(async (err) => {
          this.utils.showErrorDialog(this.dialog, err);
        })
      )
      .subscribe((response) => {
        this.workOrderStatus = response.length ? response : [];
        // this.workOrderStatus = response.filter((obj: any) => {
        //   if (obj.code !== 'IN_ACTIVE') {
        //     return obj;
        //   }
        // });
        this.cdr.detectChanges();
      });
  }

  getAllWorkOrders(filterObj: any) {
    this.loading = true;
    this.apiLoad = false;
    const endPoint = this.isFromInbox
      ? this.getNotificationEndPoints()
      : this.endPoints.ALL_WORK_ORDERS;

    //sort by

    switch (this.sort.active) {
      case 'workOrderId':
        filterObj.sortingType =
          this.sort.direction === 'desc'
            ? 'WorkOrder_ID_Descending'
            : 'WorkOrder_ID';
        break;
      case 'type':
        filterObj.sortingType =
          this.sort.direction === 'desc' ? 'JobType_Descending' : 'JobType';
        break;
      case 'title':
        filterObj.sortingType =
          this.sort.direction === 'desc' ? 'Title_Descending' : 'Title';
        break;
      case 'jobPostId':
        filterObj.sortingType =
          this.sort.direction === 'desc'
            ? 'JobPost_ID_Descending'
            : 'JobPost_ID';
        break;
      case 'priority':
        filterObj.sortingType =
          this.sort.direction === 'desc' ? 'Priority_Descending' : 'Priority';
        break;
      case 'startDate':
        filterObj.sortingType =
          this.sort.direction === 'desc' ? 'FromDate_Descending' : 'FromDate';
        break;
      case 'endDate':
        filterObj.sortingType =
          this.sort.direction === 'desc' ? 'To_Date_Descending' : 'To_Date';
        break;
      case 'managerDetails':
        filterObj.sortingType =
          this.sort.direction === 'desc'
            ? 'Manager_Name_Descending'
            : 'Manaer_Name';
        break;
      case 'status':
        filterObj.sortingType =
          this.sort.direction === 'desc' ? 'By_Status_Descending' : 'By_Status';
        break;
      default:
        filterObj.sortingType =
          this.sort.direction === 'desc'
            ? 'WorkOrder_ID_Descending'
            : 'WorkOrder_ID';
        break;
    }
    if (!filterObj.vendorId) {
      delete filterObj.vendorId;
    }

    this.apiCalls
      .get(endPoint, filterObj)
      .pipe(
        catchError(async (err) => {
          this.utils.showErrorDialog(this.dialog, err);
          this.loading = false;
          this.apiLoad = true;
          this.totalWorkOrderCount = 0;
          this.cdr.detectChanges();
          throw err;
        })
      )
      .subscribe((response) => {
        if (this.loading) {
          this.totalWorkOrderCount = response ? response.TotalCount : 0;
          this.dataSource = new MatTableDataSource<any>(response.list);
          this.dataSource.paginator = this.paginator;
          this.dataSource.sort = this.sort;

          setTimeout(() => {
            this.paginator.pageIndex = this.filterObj.pageNo - 1;
            this.paginator.length = this.totalWorkOrderCount;
          });
          this.loading = false;
          this.apiLoad = true;

          const queryParamObj: any = {
            pageNo: this.filterObj.pageNo,
            pageSize: this.paginator.pageSize.toString(),
            sortBy: this.sort.active,
            sortOrder: this.sort.direction,
          };

          for (var i in filterObj) {
            if (filterObj[i]) {
              if (
                i === 'status' ||
                i === 'type' ||
                i === 'workOrderId' ||
                i === 'startDate' ||
                i === 'endDate' ||
                i === 'searchByManager'
              ) {
                queryParamObj[i] = filterObj[i];
              }
            }
          }

          var queryParams = new URLSearchParams();

          // // Set new or modify existing parameter value.
          for (var i in queryParamObj) {
            if (queryParamObj[i]) {
              queryParams.set(i, queryParamObj[i]);
            }
          }

          if (this.isFromInbox) {
            queryParams.set('from', this.flag);
          }

          this.queryParamData = queryParamObj;
          var newURL = location.href.split('?')[0];
          window.history.pushState(
            'object',
            document.title,
            newURL + '?' + queryParams.toString()
          );

          this.cdr.detectChanges();
        }
      });
  }

  getNotificationEndPoints() {
    return this.flag === 'Inbox'
      ? this.endPoints.WORKORDER_NOTIFICATION
      : this.endPoints.WORKORDER_NOTIFICATION_OUTBOX;
  }

  getWorkOrderCount() {
    // this.isLoading = true;
    this.apiCalls
      .get(this.endPoints.ALL_WORK_ORDERS_COUNT)
      .pipe(
        catchError(async (err) => {
          this.utils.showErrorDialog(this.dialog, err);
          // this.isLoading = false;
          this.cdr.detectChanges();
          throw err;
        })
      )
      .subscribe((response) => {
        console.log('response', response);
        // this.jobCount = response;
        this.totalWorkOrderCount = response;
        this.cdr.detectChanges();
      });
  }
  goToDetails(element: any) {
    this.readNotification(element);
    if (this.isFromInbox) {
      this.router.navigate(['/work-order/details'], {
        queryParams: { workOrderId: element.workOrderId, from: this.flag },
      });
    } else {
      this.router.navigate(['/work-order/details'], {
        queryParams: { workOrderId: element.workOrderId },
      });
    }
  }

  truncateText(text: string, maxLength: number): string {
    if (!text) return '';
    let truncateText =
      text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
    const div = document.createElement('div');
    div.innerHTML = truncateText;
    return div.textContent || div.innerText || '';
  }

  applySearchFilter(event: any) {
    if (event.target.value) {
      this.filterObj.workOrderId = event.target.value;
      this.filterObj.pageNo = 1;
      this.filterObj.pageSize = 10;
      this.sort.active = 'workOrderId';
      this.sort.direction = 'desc';
      this.getAllWorkOrders(this.filterObj);
    } else {
      this.clearSearch('workOrderId');
    }
  }

  clearSearch(val: keyof FilterObj) {
    delete this.filterObj[val];
    this.filterObj.pageNo = 1;
    this.filterObj.pageSize = 10;
    this.getAllWorkOrders(this.filterObj);
  }

  filterByType(event: any) {
    if (event.value == 'All Types') {
      this.filterObj.type = '';
    } else {
      this.filterObj.type = event.value;
    }
    this.filterObj.pageNo = 1;
    this.filterObj.pageSize = 10;
    this.sort.active = 'workOrderId';
    this.sort.direction = 'desc';
    this.getAllWorkOrders(this.filterObj);
  }

  filterByManager(event: any) {
    if (event.target.value && event.target.value.length >= 3) {
      this.filterObj.searchByManager = event.target.value;
      this.filterObj.pageNo = 1;
      this.filterObj.pageSize = 10;
      this.sort.active = 'workOrderId';
      this.sort.direction = 'desc';
      this.getAllWorkOrders(this.filterObj);
    } else {
      this.clearSearch('searchByManager');
    }
  }

  filterByStatus(event: any) {
    if (event.value == 'All Status') {
      this.filterObj.status = '';
    } else {
      this.filterObj.status = event.value;
    }
    this.filterObj.pageNo = 1;
    this.filterObj.pageSize = 10;
    this.sort.active = 'workOrderId';
    this.sort.direction = 'desc';
    this.getAllWorkOrders(this.filterObj);
  }

  filterByDate(event: any, dateType: 'startDate' | 'endDate') {
    let date = this.changeDateToUtc(event);
    this.filterObj[dateType] = date;
    this.filterObj.pageNo = 1;
    this.filterObj.pageSize = 10;
    this.sort.active = 'workOrderId';
    this.sort.direction = 'desc';
    this.getAllWorkOrders(this.filterObj);
  }

  changeDateToUtc(dateObj: any) {
    const date = new Date(dateObj);
    const utcDate = date.toISOString();
    return utcDate;
  }

  clearFilters() {
    delete this.filterObj.workOrderId;
    delete this.filterObj.searchByManager;
    delete this.filterObj.type;
    delete this.filterObj.startDate;
    delete this.filterObj.endDate;
    this.filterObj.status = '';
    this.filterObj.type = '';
    this.filterValue.status = 'All Status';
    this.filterValue.workOrderId = '';
    this.filterValue.searchByManager = '';
    this.filterValue.startDate = '';
    this.filterValue.endDate = '';
    this.filterValue.type = 'All Types';
    this.filterObj.pageNo = 1;
    this.filterObj.pageSize = 10;
    this.sort.active = 'workOrderId';
    this.sort.direction = 'desc';
    this.getAllWorkOrders(this.filterObj);
  }

  readNotification(obj: any) {
    if (obj.readStatus === 'UNREAD') {
      var formData = new FormData();
      formData.append('notificationId', obj.notificationId);
      this.apiCalls
        .post(this.endPoints.READ_NOTIFICATION, formData)
        .pipe(catchError(async (err) => {}))
        .subscribe(async (response) => {
          let notify = new NavbarComponent(this.utils, this.apiCalls, this.cdr);
          notify.getNotificationCounter();
          this.cdr.detectChanges();
        });
    }
  }
}

type FilterObj = {
  vendorId: string;
  status?: string;
  workOrderId?: string;
  searchByManager?: string;
  type?: string;
  startDate?: any;
  endDate?: any;
  pageNo: number;
  pageSize: number;
};

type FilterValue = {
  status?: string;
  workOrderId?: string;
  searchByManager?: string;
  startDate?: string;
  endDate?: string;
  type?: string;
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
