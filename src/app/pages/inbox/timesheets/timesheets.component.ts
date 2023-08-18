import { ChangeDetectorRef, Component, OnInit, ViewChild } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
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
    private route: ActivatedRoute
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

  ngAfterViewInit() {
    this.route.queryParams.subscribe((param) => {
      this.sort.sortChange.subscribe(() => {
        this.sortBy = this.sort.active;
        this.sortOrder = this.sort.direction;
        this.paginator.pageIndex = 0;
      });
      this.paginator.pageIndex = param['pageNo']
        ? parseInt(param['pageNo'])
        : 0;
      this.paginator.pageSize = param['pageSize']
        ? parseInt(param['pageSize'])
        : 10;
      this.sortBy = param['sortBy'] ? param['sortBy'] : 'timeSheetId';
      this.flag = param['flag'] ? param['flag'] : this.flag;
      this.sortOrder = param['sortOrder'] ? param['sortOrder'] : 'desc';
      this.sort.active = this.sortBy;
      this.sort.direction = this.sortOrder === 'desc' ? 'desc' : 'asc';

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
    this.getAllTimeSheetStatus();
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
    this.paginator.pageIndex = 0;
    this.sort.active = 'timeSheetId';
    this.sort.direction = 'desc';
    this.paginator.pageSize = 10;
    this.getAllTimesheet();
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

  // getAllTimesheet() {
  //   this.isApiLoad = false;
  //   this.isLoading = true;
  //   let filter: any = {};
  //   if (this.timeSheetFilter.controls['status'].value !== 'All') {
  //     filter.status = [this.timeSheetFilter.controls['status'].value];
  //   }
  //   if (this.timeSheetFilter.controls['searchByEmployee'].value) {
  //     filter.searchByEmployee =
  //       this.timeSheetFilter.controls['searchByEmployee'].value;
  //   }
  //   if (this.timeSheetFilter.controls['timeSheetId'].value) {
  //     filter.timeSheetId = this.timeSheetFilter.controls['timeSheetId'].value;
  //   }
  //   if (this.timeSheetFilter.controls['workOrderId'].value) {
  //     filter.workOrderId = this.timeSheetFilter.controls['workOrderId'].value;
  //   }
  //   if (this.timeSheetFilter.controls['fromDate'].value) {
  //     filter.fromDate = this.changeDateToUtc(
  //       this.timeSheetFilter.controls['fromDate'].value
  //     );
  //   }
  //   if (this.timeSheetFilter.controls['toDate'].value) {
  //     filter.toDate = this.changeDateToUtc(
  //       this.timeSheetFilter.controls['toDate'].value
  //     );
  //   }

  //   this.apiCalls
  //     .get(this.getEndpoint(this.flag), filter)
  //     .pipe(
  //       catchError(async (err) => {
  //         this.utils.showSnackBarMessage(
  //           this.snackBar,
  //           'failed to fetch the time-sheet notification'
  //         );
  //         this.dataSource = new MatTableDataSource<any>([]);
  //         this.dataSource.paginator = this.paginator;
  //         this.dataSource.sort = this.sort;
  //         this.isLoading = false;
  //         this.isApiLoad = true;
  //         this.cdr.detectChanges();
  //         throw err;
  //       })
  //     )
  //     .subscribe((response) => {
  //       this.timeSheetList = response;
  //       for (let index = 0; index < response.length; index++) {
  //         const element = response[index];

  //         element.timeSpent = 0;
  //         if (element.taskListDetails?.length) {
  //           for (let i = 0; i < element.taskListDetails.length; i++) {
  //             element.timeSpent += element.taskListDetails[i].timeSpent
  //               ? parseInt(element.taskListDetails[i].timeSpent)
  //               : 0;
  //           }
  //         }
  //         element.status = element.displayStatus;
  //       }
  //       this.dataSource = new MatTableDataSource<any>(response);
  //       this.dataSource.paginator = this.paginator;
  //       this.dataSource.sort = this.sort;
  //       this.isLoading = false;
  //       this.isApiLoad = true;
  //       this.cdr.detectChanges();
  //     });
  // }

  getAllTimesheet() {
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

    merge(this.sort.sortChange, this.paginator.page)
      .pipe(
        startWith({}),
        switchMap(() => {
          this.isLoading = true;
          this.isApiLoad = false;
          filter.pageNo = this.paginator.pageIndex + 1;
          filter.pageSize = this.paginator.pageSize;
          this.pageSize = this.paginator.pageSize;
          this.pageNo = this.paginator.pageIndex;
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
                this.sort.direction === 'desc'
                  ? 'By_ToDate_Descending'
                  : 'By_ToDate';
              break;
            default:
              filter.sortingType =
                this.sort.direction === 'desc'
                  ? 'By_TimeSheet_ID_Descending'
                  : 'By_TimeSheet_ID';
              break;
          }

          return this.apiCalls
            .get(this.getEndpoint(this.flag), filter)
            .pipe(catchError(() => observableOf(null)));
        }),
        map((data) => {
          return data;
        })
      )
      .subscribe((response) => {
        this.apiCalls
          .get(this.getEndpointCount(this.flag), filter)
          .pipe(
            catchError(async (err) => {
              this.utils.showSnackBarMessage(
                this.snackBar,
                'failed to fetch the time-sheet'
              );
              this.isApiLoad = true;
              this.timeSheetList = [];
              this.isLoading = false;
              this.cdr.detectChanges();
              throw err;
            })
          )
          .subscribe((responseCount) => {
            this.totalCount = responseCount;

            for (let index = 0; index < response.length; index++) {
              const element = response[index];

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
            this.timeSheetList = response;

            this.isLoading = false;
            this.isApiLoad = true;
            this.cdr.detectChanges();
          });
      });
  }

  getAllWorkForceList() {
    this.apiCalls
      .get(this.endPoints.LIST_WORK_FORCE, {})
      .pipe(
        catchError(async (err) => {
          this.utils.showSnackBarMessage(
            this.snackBar,
            'failed to fetch the work-force'
          );
          throw err;
        })
      )
      .subscribe((response) => {
        this.workForceList = response;
        this.getAllTimesheet();
        this.cdr.detectChanges();
      });
  }
  getAllTimeSheetStatus() {
    this.apiCalls
      .get(this.endPoints.GET_TIMESHEET_STATUS, {})
      .pipe(
        catchError(async (err) => {
          this.utils.showSnackBarMessage(
            this.snackBar,
            'failed to fetch the timesheet-status'
          );
          throw err;
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
        .subscribe(async (response) => {});
    }
  }
  onKeypressEvent(event: any) {
    setTimeout(() => {
      if (event.target.value.length > 2) {
        this.getAllTimesheet();
      } else if (event.target.value.length === 0) {
        this.getAllTimesheet();
      }
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
