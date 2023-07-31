import { ChangeDetectorRef, Component, OnInit, ViewChild } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import EndPoints from 'src/app/common/endpoints';
import { ApiCallsService } from 'src/app/services/api-calls.service';
import { Utils } from 'src/app/services/utils';
import { Observable, catchError, throwError } from 'rxjs';
import { AuthService } from 'src/app/modules/auth';
import { MatSnackBar } from '@angular/material/snack-bar';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
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
    private fb: FormBuilder
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
  dataSource = new MatTableDataSource<PeriodicElement>([]);
  endPoints = EndPoints;
  auth: any;
  workForceList: any = [];
  isLoading = false;
  lstTimeSheetStatus: any;
  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;
  timeSheetFilter: FormGroup;
  ngAfterViewInit() {}
  ngOnInit(): void {
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
    this.getAllTimesheet();
  }
  changeDateToUtc(dateObj: any) {
    const date = new Date(dateObj);
    const utcDate = date.toISOString();
    return utcDate;
  }
  getAllTimesheet() {
    this.isLoading = true;
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

    this.apiCalls
      .get(this.endPoints.GET_TIME_SHEET, filter)
      .pipe(
        catchError(async (err) => {
          this.utils.showSnackBarMessage(
            this.snackBar,
            'failed to fetch the time-sheet'
          );
          this.isLoading = false;
          this.cdr.detectChanges();
          throw err;
        })
      )
      .subscribe((response) => {
        this.timeSheetList = response;
        for (let index = 0; index < response.length; index++) {
          const element = response[index];

          element.timeSpent = 0;

          for (let i = 0; i < element.taskListDetails.length; i++) {
            element.timeSpent += element.taskListDetails[i].timeSpent
              ? parseInt(element.taskListDetails[i].timeSpent)
              : 0;
          }
          element.status = this.lstTimeSheetStatus.length
            ? this.lstTimeSheetStatus.find(
                (r: any) => r.code === element.status
              ).title
            : '';
        }
        this.dataSource = new MatTableDataSource<any>(response);
        this.dataSource.paginator = this.paginator;
        this.dataSource.sort = this.sort;
        this.isLoading = false;
        this.cdr.detectChanges();
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
