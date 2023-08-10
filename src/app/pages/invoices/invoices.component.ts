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
    private fb: FormBuilder
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

  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;
  auth: any;
  ngAfterViewInit() {}
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
    this.getAllWorkForceList();
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
    this.apiCalls
      .get(this.endPoints.GET_INVOICE, filter)
      .pipe(
        catchError(async (err) => {
          this.utils.showSnackBarMessage(
            this.snackBar,
            'failed to fetch the invoices'
          );
          this.isLoading = false;
          this.isApiLoad = true;
          this.dataSource = new MatTableDataSource<any>([]);
          this.dataSource.sort = this.sort;
          this.dataSource.paginator = this.paginator;
          this.cdr.detectChanges();
          throw err;
        })
      )
      .subscribe((response) => {
        this.invoiceList = response;

        // for (let index = 0; index < response.length; index++) {
        //   const element = response[index];
        //   element.status = element.displayStatus;
        // }

        this.dataSource = new MatTableDataSource<any>(response);
        this.dataSource.paginator = this.paginator;
        this.dataSource.sort = this.sort;
        this.isLoading = false;
        this.isApiLoad = true;
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
