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
      this.sortOrder = param['sortOrder'] ? param['sortOrder'] : 'desc';
      this.sort.active = this.sortBy;
      this.sort.direction = this.sortOrder === 'desc' ? 'desc' : 'asc';
      this.cdr.detectChanges();
      this.getAllTimeSheetStatus();
    });
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
        this.getAllTimesheet();
      } else if (event.target.value.length === 0) {
        this.getAllTimesheet();
      }
    });
  }

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
            .get(this.endPoints.GET_TIME_SHEET, filter)
            .pipe(catchError(() => observableOf(null)));
        }),
        map((data) => {
          return data;
        })
      )
      .subscribe((response) => {
        this.apiCalls
          .get(this.endPoints.GET_TIME_SHEET_COUNT, filter)
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
