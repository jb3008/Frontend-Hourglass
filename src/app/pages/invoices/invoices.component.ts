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
  selector: 'app-invoices',
  templateUrl: './invoices.component.html',
  styleUrls: ['./invoices.component.scss'],
})
export class InvoicesComponent implements OnInit {
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
  isApiLoad: boolean = false;
  workForceList: any = [];
  invoiceList: any = [];
  lstTimeSheetStatus: any;

  displayedColumns: string[] = [
    'invoiceId',
    'employee',
    'workOrderId',
    'invoiceDate',
    'dueDate',
    'amount',
    'status',
  ];
  dataSource = new MatTableDataSource<PeriodicElement>([]);
  endPoints = EndPoints;
  isLoading = false;
  invoiceFilter: FormGroup;

  pageSize: number = 10;
  pageNo: number = 0;
  totalCount: number = 0;
  sortBy: string = 'invoiceId';
  sortOrder: string = 'DESC';

  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;
  auth: any;

  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
    this.sort.sortChange.subscribe(() => (this.paginator.pageIndex = 0));
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

      this.getAllWorkForceList();
      this.cdr.detectChanges();
    });
  }
  ngOnInit(): void {
    this.isApiLoad = false;
    this.auth = this.utils.getAuth();
    this.invoiceFilter = this.fb.group({
      invoiceTaskId: [''],
      invoiceId: [''],
      invoiceDate: [''],
      dueDate: [''],
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
  getAllInvoice() {
    this.isLoading = true;
    this.isApiLoad = false;
    let filter: any = {};
    if (this.invoiceFilter.controls['status'].value !== 'All') {
      filter.status = [this.invoiceFilter.controls['status'].value];
    }
    if (this.invoiceFilter.controls['searchByEmployee'].value) {
      filter.searchByEmployee =
        this.invoiceFilter.controls['searchByEmployee'].value;
    }
    if (this.invoiceFilter.controls['invoiceId'].value) {
      filter.invoiceId = this.invoiceFilter.controls['invoiceId'].value;
    }
    if (this.invoiceFilter.controls['workOrderId'].value) {
      filter.workOrderId = this.invoiceFilter.controls['workOrderId'].value;
    }
    if (this.invoiceFilter.controls['invoiceDate'].value) {
      filter.invoiceDate = this.changeDateToUtc(
        this.invoiceFilter.controls['invoiceDate'].value
      );
    }
    if (this.invoiceFilter.controls['dueDate'].value) {
      filter.dueDate = this.changeDateToUtc(
        this.invoiceFilter.controls['dueDate'].value
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
            case 'invoiceId':
              filter.sortingType =
                this.sort.direction === 'desc'
                  ? 'By_Invoice_Num_Descending'
                  : 'By_Invoice_Num';
              break;
            case 'workOrderId':
              filter.sortingType =
                this.sort.direction === 'desc'
                  ? 'By_WorkOrder_ID_Descending'
                  : 'By_WorkOrder_ID';
              break;
            case 'employee':
              filter.sortingType =
                this.sort.direction === 'desc'
                  ? 'By_Created_by_Descending'
                  : 'By_Created_by';
              break;
            case 'invoiceDate':
              filter.sortingType =
                this.sort.direction === 'desc'
                  ? 'By_Date_Descending'
                  : 'By_Date';
              break;
            case 'dueDate':
              filter.sortingType =
                this.sort.direction === 'desc'
                  ? 'By_DueDate_Descending'
                  : 'By_DueDate';
              break;
            case 'amount':
              filter.sortingType =
                this.sort.direction === 'desc'
                  ? 'By_Amount_Descending'
                  : 'By_Amount';
              break;
            case 'status':
              filter.sortingType =
                this.sort.direction === 'desc'
                  ? 'By_Status_Descending'
                  : 'By_Status';
              break;
            default:
              filter.sortingType =
                this.sort.direction === 'desc'
                  ? 'By_Invoice_Num_Descending'
                  : 'By_Invoice_Num';
              break;
          }

          return this.apiCalls
            .get(this.endPoints.GET_INVOICE, filter)
            .pipe(catchError(() => observableOf(null)));
        }),
        map((data) => {
          return data;
        })
      )
      .subscribe((response) => {
        this.apiCalls
          .get(this.endPoints.GET_INVOICE_COUNT, filter)
          .pipe(
            catchError(async (err) => {
              this.utils.showSnackBarMessage(
                this.snackBar,
                'failed to fetch the invoices'
              );
              this.isApiLoad = true;
              this.invoiceList = [];
              this.isLoading = false;
              this.cdr.detectChanges();
              throw err;
            })
          )
          .subscribe((responseCount) => {
            this.totalCount = responseCount;
            this.invoiceList = response;
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
        this.getAllInvoice();
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
        this.getAllInvoice();
        this.cdr.detectChanges();
      });
  }
  onKeypressEvent(event: any) {
    setTimeout(() => {
      if (event.target.value.length > 2) {
        this.getAllInvoice();
      } else if (event.target.value.length === 0) {
        this.getAllInvoice();
      }
    });
  }
}

export interface PeriodicElement {
  invoiceId: number;
  employee: string;
  workOrderId: number;
  invoiceDate: string;
  dueDate: string;
  amount: string;
  status: string;
}
