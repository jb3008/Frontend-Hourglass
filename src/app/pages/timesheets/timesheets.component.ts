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
    private authService: AuthService
  ) {}
  timeSheetList: any = [];
  displayedColumns: string[] = [
    'timeSheetId',
    'employee',
    'workOrderId',
    'fromDate',
    'toDate',
    'totalTimeSpent',
    'status',
  ];
  dataSource = new MatTableDataSource<PeriodicElement>(ELEMENT_DATA);
  endPoints = EndPoints;
  workForceList: any = [];
  isLoading = false;
  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;

  ngAfterViewInit() {}
  ngOnInit(): void {
    this.getAllWorkForceList();
    this.getAllTimesheet();
  }
  getAllTimesheet() {
    this.isLoading = true;
    this.apiCalls
      .get(this.endPoints.GET_TIME_SHEET, {})
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

          const emp: any = this.workForceList.find(
            (o: any) => parseInt(o.workForceId) === parseInt(element.employeeId)
          );

          response[index].employee = emp;
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
  totalTimeSpent: string;
  status: string;
}

const ELEMENT_DATA: PeriodicElement[] = [
  {
    timeSheetId: 2786111763,
    employee: 'Wade Warren',
    workOrderId: 2786111763,
    fromDate: 'May 30, 2023',
    toDate: 'May 30, 2023',
    totalTimeSpent: '16.0 (hr)',
    status: 'In-Progress',
  },
];
