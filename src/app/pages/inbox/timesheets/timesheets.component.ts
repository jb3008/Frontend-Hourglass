import { ChangeDetectorRef, Component, OnInit, ViewChild } from '@angular/core';
import { MatPaginator, PageEvent } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import EndPoints from 'src/app/common/endpoints';
import { ApiCallsService } from 'src/app/services/api-calls.service';
import { Utils } from 'src/app/services/utils';
import {
  catchError,
  merge,
  throwError,
  Observable,
  of as observableOf,
} from 'rxjs';
import { map, startWith, switchMap } from 'rxjs/operators';
import { AuthService } from 'src/app/modules/auth';
import { MatSnackBar } from '@angular/material/snack-bar';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { NavbarComponent } from 'src/app/_metronic/layout/components/header/navbar/navbar.component';

@Component({
  selector: 'app-timesheets',
  templateUrl: './timesheets.component.html',
  styleUrls: ['./timesheets.component.scss'],
})
export class TimesheetsComponent implements OnInit {
  constructor(
    private apiCalls: ApiCallsService,
    private utils: Utils,
    private snackBar: MatSnackBar,
    private cdr: ChangeDetectorRef,
    private authService: AuthService,
    private fb: FormBuilder,
    private router: Router,
    private route: ActivatedRoute,
    private dialog: MatDialog
  ) {}
  timeSheetList: any = [];
  isApiLoad: boolean = false;
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
  endPoints = EndPoints;
  auth: any;
  workForceList: any = [];
  isLoading = false;
  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;
  timeSheetFilter: FormGroup;
  pageSize: number = 10;
  pageNo: number = 0;
  totalCount: number = 0;
  sortBy: string = 'timeSheetId';
  sortOrder: string = 'desc';
  lstTimeSheetStatus: any;
  flag: any = 'Inbox';
  queryParamData: any;
  ngAfterViewInit() {
    this.route.queryParams.subscribe((param) => {
      this.queryParamData = param;
      this.sort.sortChange.subscribe(() => {
        this.sortBy = this.sort.active;
        this.sortOrder = this.sort.direction;
        this.paginator.pageIndex = 0;
        this.getAllTimesheet();
      });
      this.paginator.pageIndex = param['pageNo']
        ? parseInt(param['pageNo'])
        : 0;
      this.paginator.pageSize = param['pageSize']
        ? parseInt(param['pageSize'])
        : 10;
      this.sortBy = param['sortBy'] ? param['sortBy'] : 'timeSheetId';
      this.flag = param['flag'] ? param['flag'] : this.flag;
      this.isSelectedTab = this.flag;
      this.sortOrder = param['sortOrder'] ? param['sortOrder'] : 'desc';
      this.sort.active = this.sortBy;
      this.sort.direction = this.sortOrder === 'desc' ? 'desc' : 'asc';

      for (var i in this.timeSheetFilter.controls) {
        if (this.queryParamData[i]) {
          if (i === 'fromDate') {
            this.timeSheetFilter.controls[i].setValue(
              new Date(this.queryParamData[i])
            );
          } else if (i === 'toDate') {
            this.timeSheetFilter.controls[i].setValue(
              new Date(this.queryParamData[i])
            );
          } else {
            this.timeSheetFilter.controls[i].setValue(this.queryParamData[i]);
          }
        }
      }
      this.getAllTimeSheetStatus();
      this.cdr.detectChanges();
    });
  }
  ngOnInit(): void {
    this.isApiLoad = false;
    this.auth = this.utils.getAuth();
    this.timeSheetFilter = this.fb.group({
      timeSheetTaskId: [''],
      timeSheetId: [''],
      fromDate: [''],
      toDate: [''],
      workOrderId: [''],
      status: ['All'],
      searchByEmployee: [''],
    });
  }

  goDetail(element: any) {
    this.readNotification(element);
    const queryParam: any = {
      pageNo: this.paginator.pageIndex,
      pageSize: this.paginator.pageSize,
      sortBy: this.sort.active,
      sortOrder: this.sort.direction,
      flag: this.flag,
    };
    for (var i in this.timeSheetFilter.controls) {
      queryParam[i] = this.timeSheetFilter.controls[i].value;
    }
    if (this.auth.vendorId) {
      if (this.flag === 'Inbox') {
        this.router.navigate(
          ['/inbox/inbox-timesheets-details/', element.timeSheetId],
          {
            queryParams: queryParam,
          }
        );
      } else {
        this.router.navigate(
          ['/inbox/outbox-timesheets-details/', element.timeSheetId],
          {
            queryParams: queryParam,
          }
        );
      }
    } else {
      if (this.flag === 'Inbox') {
        this.router.navigate(
          ['/hm/inbox/inbox-timesheets-details/', element.timeSheetId],
          {
            queryParams: queryParam,
          }
        );
      } else {
        this.router.navigate(
          ['/hm/inbox/outbox-timesheets-details/', element.timeSheetId],
          {
            queryParams: queryParam,
          }
        );
      }
    }
  }
  changeDateToUtc(dateObj: any) {
    const date = new Date(dateObj);
    const utcDate = date.toISOString();
    return utcDate;
  }

  isSelectedTab: string = 'Inbox';
  changeFlag(flag: string) {
    if (flag === 'Inbox') {
      this.flag = 'Inbox';
      this.isSelectedTab = flag;
    } else {
      this.flag = 'Outbox';
      this.isSelectedTab = flag;
    }

    this.ReloadTable();
  }

  getEndpoint(flag: string) {
    return flag === 'Inbox'
      ? this.endPoints.GET_TIME_SHEET_NOTIFICATION
      : this.endPoints.GET_TIME_SHEET_OUTBOX;
  }
  getEndpointCount(flag: string) {
    return flag === 'Inbox'
      ? this.endPoints.GET_TIME_SHEET_NOTIFICATION_COUNT
      : this.endPoints.GET_TIME_SHEET_OUTBOX_COUNT;
  }

  getAllTimesheet() {
    this.isLoading = true;
    this.isApiLoad = false;
    let filter: any = {};
    if (this.timeSheetFilter.controls['status'].value !== 'All') {
      filter.status = [this.timeSheetFilter.controls['status'].value];
    }
    if (this.timeSheetFilter.controls['searchByEmployee'].value) {
      filter.searchByEmployee =
        this.timeSheetFilter.controls['searchByEmployee'].value;
    }
    if (this.timeSheetFilter.controls['timeSheetId'].value) {
      filter.timeSheetId = this.timeSheetFilter.controls['timeSheetId'].value;
    }
    if (this.timeSheetFilter.controls['workOrderId'].value) {
      filter.workOrderId = this.timeSheetFilter.controls['workOrderId'].value;
    }
    if (this.timeSheetFilter.controls['fromDate'].value) {
      filter.fromDate = this.changeDateToUtc(
        this.timeSheetFilter.controls['fromDate'].value
      );
    }
    if (this.timeSheetFilter.controls['toDate'].value) {
      filter.toDate = this.changeDateToUtc(
        this.timeSheetFilter.controls['toDate'].value
      );
    }
    filter.pageNo = this.paginator.pageIndex + 1;
    filter.pageSize = this.paginator.pageSize;

    switch (this.sort.active) {
      case 'timeSheetId':
        filter.sortingType =
          this.sort.direction === 'desc'
            ? 'By_TimeSheet_ID_Descending'
            : 'By_TimeSheet_ID';
        break;
      case 'workOrderId':
        filter.sortingType =
          this.sort.direction === 'desc'
            ? 'By_WorkOrder_ID_Descending'
            : 'By_WorkOrder_ID';
        break;
      case 'fromDate':
        filter.sortingType =
          this.sort.direction === 'desc'
            ? 'By_FromDate_Descending'
            : 'By_FromDate';
        break;
      case 'toDate':
        filter.sortingType =
          this.sort.direction === 'desc' ? 'By_ToDate_Descending' : 'By_ToDate';
        break;
      default:
        filter.sortingType =
          this.sort.direction === 'desc'
            ? 'By_TimeSheet_ID_Descending'
            : 'By_TimeSheet_ID';
        break;
    }
    this.apiCalls
      .get(this.getEndpoint(this.flag), filter)
      .pipe(
        catchError(async (err) => {
          this.utils.showErrorDialog(this.dialog, err);
          this.totalCount = 0;
          this.isApiLoad = true;
          this.timeSheetList = [];
          this.isLoading = false;
          this.cdr.detectChanges();
          throw err;
        })
      )
      .subscribe((response) => {
        if (this.isLoading) {
          this.totalCount = response.TotalCount;

          for (let index = 0; index < response.list.length; index++) {
            const element = response.list[index];

            element.timeSpent = 0;

            if (element.taskListDetails?.length) {
              for (let i = 0; i < element.taskListDetails.length; i++) {
                element.timeSpent += element.taskListDetails[i].timeSpent
                  ? parseInt(element.taskListDetails[i].timeSpent)
                  : 0;
              }
            }
            element.status = element.displayStatus;
          }
          this.timeSheetList = response.list;

          this.isLoading = false;
          this.isApiLoad = true;
          const queryParamObj: any = {
            pageNo: this.paginator.pageIndex.toString(),
            pageSize: this.paginator.pageSize.toString(),
            sortBy: this.sort.active,
            sortOrder: this.sort.direction,
            flag: this.flag,
          };
          for (var i in this.timeSheetFilter.controls) {
            queryParamObj[i] = this.timeSheetFilter.controls[i].value;
          }

          var queryParams = new URLSearchParams();

          // // Set new or modify existing parameter value.
          for (var i in queryParamObj) {
            if (queryParamObj[i]) {
              queryParams.set(i, queryParamObj[i]);
            }
          }

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
  handlePageEvent(e: PageEvent) {
    this.getAllTimesheet();
  }
  ReloadTable() {
    this.paginator.pageIndex = 0;
    this.paginator.pageSize = 10;
    this.sort.active = 'timeSheetId';
    this.sort.direction = 'desc';
    this.getAllTimesheet();
  }

  getAllTimeSheetStatus() {
    this.apiCalls
      .get(this.endPoints.GET_TIMESHEET_STATUS, {})
      .pipe(
        catchError(async (err) => {
          this.utils.showErrorDialog(this.dialog, err);
        })
      )
      .subscribe((response) => {
        this.lstTimeSheetStatus = response;
        this.getAllTimesheet();
        this.cdr.detectChanges();
      });
  }

  readNotification(obj: any) {
    if (obj.notificationStatus === 'UNREAD') {
      var formData = new FormData();
      formData.append('notificationId', obj.notificationId);
      this.apiCalls
        .post(this.endPoints.READ_NOTIFICATION, formData)
        .pipe(
          catchError(async (err) => {
            this.isLoading = false;
            setTimeout(() => {
              throw err;
            }, 10);
          })
        )
        .subscribe(async (response) => {
          let notify = new NavbarComponent(this.utils, this.apiCalls, this.cdr);
          notify.getNotificationCounter();
        });
    }
  }
  onKeypressEvent(event: any) {
    setTimeout(() => {
      this.ReloadTable();
    });
  }
}

export interface PeriodicElement {
  timeSheetId: number;
  employee: string;
  workOrderId: number;
  fromDate: string;
  toDate: string;
  timeSpent: string;
  status: string;
}
