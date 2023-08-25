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
  queryParamData: any;
  ngAfterViewInit() {
    this.route.queryParams.subscribe((param) => {
      this.queryParamData = param;
      this.sort.sortChange.subscribe(() => {
        this.sortBy = this.sort.active;
        this.sortOrder = this.sort.direction;
        this.paginator.pageIndex = 0;
        this.getAllInvoice();
      });
      this.paginator.pageIndex = param['pageNo']
        ? parseInt(param['pageNo'])
        : 0;

      this.paginator.pageSize = param['pageSize']
        ? parseInt(param['pageSize'])
        : 10;
      this.sortBy = param['sortBy'] ? param['sortBy'] : 'invoiceId';
      this.sortOrder = param['sortOrder'] ? param['sortOrder'] : 'desc';
      this.sort.active = this.sortBy;
      this.sort.direction = this.sortOrder === 'desc' ? 'desc' : 'asc';
      for (var i in this.invoiceFilter.controls) {
        if (this.queryParamData[i]) {
          if (i === 'invoiceDate') {
            this.invoiceFilter.controls[i].setValue(
              new Date(this.queryParamData[i])
            );
          } else if (i === 'dueDate') {
            this.invoiceFilter.controls[i].setValue(
              new Date(this.queryParamData[i])
            );
          } else {
            this.invoiceFilter.controls[i].setValue(this.queryParamData[i]);
          }
        }
      }
      this.getAllWorkForceList();
      this.cdr.detectChanges();
    });
  }

  ReloadTable() {
    this.paginator.pageIndex = 0;
    this.paginator.pageSize = 10;
    this.sort.active = 'invoiceId';
    this.sort.direction = 'desc';
    this.getAllInvoice();
  }
  ngOnInit(): void {
    this.isApiLoad = false;
    this.auth = this.utils.getAuth();
    this.invoiceFilter = this.fb.group({
      // invoiceTaskId: [''],
      invoiceId: [''],
      invoiceDate: [''],
      dueDate: [''],
      workOrderId: [''],
      status: ['All'],
      searchByEmployee: [''],
    });
  }

  goDetail(invoiceId: any) {
    const queryParam: any = {
      pageNo: this.paginator.pageIndex,
      pageSize: this.paginator.pageSize,
      sortBy: this.sort.active,
      sortOrder: this.sort.direction,
    };
    for (var i in this.invoiceFilter.controls) {
      queryParam[i] = this.invoiceFilter.controls[i].value;
    }
    if (this.auth.vendorId) {
      this.router.navigate(['/invoices/invoices-details', invoiceId], {
        queryParams: queryParam,
      });
    } else {
      this.router.navigate(['/hm/invoices/invoices-details', invoiceId], {
        queryParams: queryParam,
      });
    }
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
      filter.invoiceNumber = this.invoiceFilter.controls['invoiceId'].value;
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
    filter.pageNo = this.paginator.pageIndex + 1;
    filter.pageSize = this.paginator.pageSize;

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
          this.sort.direction === 'desc' ? 'By_Date_Descending' : 'By_Date';
        break;
      case 'dueDate':
        filter.sortingType =
          this.sort.direction === 'desc'
            ? 'By_DueDate_Descending'
            : 'By_DueDate';
        break;
      case 'amount':
        filter.sortingType =
          this.sort.direction === 'desc' ? 'By_Amount_Descending' : 'By_Amount';
        break;
      case 'status':
        filter.sortingType =
          this.sort.direction === 'desc' ? 'By_Status_Descending' : 'By_Status';
        break;
      default:
        filter.sortingType =
          this.sort.direction === 'desc'
            ? 'By_Invoice_Num_Descending'
            : 'By_Invoice_Num';
        break;
    }

    this.apiCalls
      .get(this.endPoints.GET_INVOICE, filter)
      .pipe(
        catchError(async (err) => {
          this.utils.showSnackBarMessage(
            this.snackBar,
            'failed to fetch the jobs'
          );
          this.totalCount = 0;
          this.isApiLoad = true;
          this.invoiceList = [];
          this.isLoading = false;
          this.cdr.detectChanges();
          throw err;
        })
      )
      .subscribe((response) => {
        if (this.isLoading) {
          this.apiCalls
            .get(this.endPoints.GET_INVOICE_COUNT, filter)
            .pipe(
              catchError(async (err) => {
                this.utils.showSnackBarMessage(
                  this.snackBar,
                  'failed to fetch the invoice'
                );
                this.totalCount = 0;
                this.isApiLoad = true;
                this.invoiceList = [];
                this.isLoading = false;
                this.cdr.detectChanges();
                throw err;
              })
            )
            .subscribe((responseCount) => {
              if (this.isLoading) {
                this.totalCount = responseCount;
                this.invoiceList = response;
                this.isLoading = false;
                this.isApiLoad = true;
                const queryParamObj: any = {
                  pageNo: this.paginator.pageIndex.toString(),
                  pageSize: this.paginator.pageSize.toString(),
                  sortBy: this.sort.active,
                  sortOrder: this.sort.direction,
                };
                for (var i in this.invoiceFilter.controls) {
                  queryParamObj[i] = this.invoiceFilter.controls[i].value;
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
      });
  }
  handlePageEvent(e: PageEvent) {
    this.getAllInvoice();
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

  onKeypressEvent(event: any) {
    setTimeout(() => {
      if (event.target.value.length > 2) {
        this.ReloadTable();
      } else if (event.target.value.length === 0) {
        this.ReloadTable();
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
