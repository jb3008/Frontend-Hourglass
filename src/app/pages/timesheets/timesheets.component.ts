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
import { Location } from '@angular/common';

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

  displayedColumns: string[] = [
    'timeSheetId',
    'employee',
    'workOrderId',
    'fromDate',
    'toDate',
    'timeSpent',
    'status',
  ];
  isApiLoad: boolean = false;
  dataSource = new MatTableDataSource<PeriodicElement>([]);
  endPoints = EndPoints;
  auth: any;
  workForceList: any = [];
  isLoading = false;
  lstTimeSheetStatus: any;
  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;
  timeSheetFilter: FormGroup;
  pageSize: number = 10;
  pageNo: number = 0;
  totalCount: number = 0;
  sortBy: string = 'timeSheetId';
  sortOrder: string = 'desc';
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

  goDetail(timeSheetId: any) {
    const queryParam: any = {
      pageNo: this.paginator.pageIndex,
      pageSize: this.paginator.pageSize,
      sortBy: this.sort.active,
      sortOrder: this.sort.direction,
    };
    for (var i in this.timeSheetFilter.controls) {
      queryParam[i] = this.timeSheetFilter.controls[i].value;
    }
    if (this.auth.vendorId) {
      this.router.navigate(['/timesheets/timesheet-detail', timeSheetId], {
        queryParams: queryParam,
      });
    } else {
      this.router.navigate(['/hm/timesheets/timesheet-detail', timeSheetId], {
        queryParams: queryParam,
      });
    }
  }

  ngOnInit(): void {
    this.auth = this.utils.getAuth();
    this.isApiLoad = false;
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
  changeDateToUtc(dateObj: any) {
    const date = new Date(dateObj);
    const utcDate = date.toISOString();
    return utcDate;
  }
  onKeypressEvent(event: any) {
    setTimeout(() => {
      if (event.target.value.length > 2) {
        this.ReloadTable();
      } else if (event.target.value.length === 0) {
        this.ReloadTable();
      }
    });
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
      .get(this.endPoints.GET_TIME_SHEET, filter)
      .pipe(
        catchError(async (err) => {
          this.utils.showSnackBarMessage(
            this.snackBar,
            'failed to fetch the GET_TIME_SHEET'
          );
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
          this.apiCalls
            .get(this.endPoints.GET_TIME_SHEET_COUNT, filter)
            .pipe(
              catchError(async (err) => {
                this.utils.showSnackBarMessage(
                  this.snackBar,
                  'failed to fetch the time-sheet'
                );
                this.totalCount = 0;
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
              const queryParamObj: any = {
                pageNo: this.paginator.pageIndex.toString(),
                pageSize: this.paginator.pageSize.toString(),
                sortBy: this.sort.active,
                sortOrder: this.sort.direction,
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
              console.log(queryParamObj);
              var newURL = location.href.split('?')[0];
              window.history.pushState(
                'object',
                document.title,
                newURL + '?' + queryParams.toString()
              );

              this.cdr.detectChanges();
            });
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
