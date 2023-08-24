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
  displayedColumns: string[] = [
    'invoiceId',
    'invoiceDate',
    'submittedby',
    'amount',
    'status',
  ];
  invoiceList: any = [];
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
      this.flag = param['flag'] ? param['flag'] : this.flag;
      this.isSelectedTab = this.flag;
      this.sortOrder = param['sortOrder'] ? param['sortOrder'] : 'desc';
      this.sort.active = this.sortBy;
      this.sort.direction = this.sortOrder === 'desc' ? 'desc' : 'asc';
      for (var i in this.invoiceFilter.controls) {
        if (this.queryParamData[i]) {
          if (i === 'invoiceDate') {
            this.invoiceFilter.controls[i].setValue(
              new Date(this.queryParamData[i])
            );
          } else {
            this.invoiceFilter.controls[i].setValue(this.queryParamData[i]);
          }
        }
      }
      this.ReloadTable();
      this.cdr.detectChanges();
    });
  }
  ngOnInit(): void {
    this.isApiLoad = false;
    this.auth = this.utils.getAuth();
    this.invoiceFilter = this.fb.group({
      invoiceId: [''],
      invoiceDate: [''],
      status: ['All'],
    });
  }
  flag: any = 'Inbox';
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
  ReloadTable() {
    this.paginator.pageIndex = 0;
    this.paginator.pageSize = 10;
    this.sort.active = 'timeSheetId';
    this.sort.direction = 'desc';
    this.getAllInvoice();
  }
  handlePageEvent(e: PageEvent) {
    this.getAllInvoice();
  }
  changeDateToUtc(dateObj: any) {
    const date = new Date(dateObj);
    const utcDate = date.toISOString();
    return utcDate;
  }
  getEndpoint() {
    return this.flag === 'Inbox'
      ? this.endPoints.INVOICE_INBOX_NOTIFICATION
      : this.endPoints.INVOICE_OUTBOX_NOTIFICATION;
  }
  getEndpointCount() {
    return this.flag === 'Inbox'
      ? this.endPoints.INVOICE_INBOX_NOTIFICATION_COUNT
      : this.endPoints.INVOICE_OUTBOX_NOTIFICATION_COUNT;
  }

  getAllInvoice() {
    this.isLoading = true;
    this.isApiLoad = false;
    let filter: any = {};
    if (this.invoiceFilter.controls['status'].value !== 'All') {
      filter.status = [this.invoiceFilter.controls['status'].value];
    }
    if (this.invoiceFilter.controls['invoiceId'].value) {
      filter.invoiceNumber = this.invoiceFilter.controls['invoiceId'].value;
    }
    if (this.invoiceFilter.controls['invoiceDate'].value) {
      filter.invoiceDate = this.changeDateToUtc(
        this.invoiceFilter.controls['invoiceDate'].value
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

      case 'submittedby':
        filter.sortingType =
          this.sort.direction === 'desc'
            ? 'By_Created_by_Descending'
            : 'By_Created_by';
        break;
      case 'invoiceDate':
        filter.sortingType =
          this.sort.direction === 'desc' ? 'By_Date_Descending' : 'By_Date';
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
      .get(this.getEndpoint(), filter)
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
            .get(this.getEndpointCount(), filter)
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
                  flag: this.flag,
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
        this.ReloadTable();
      } else if (event.target.value.length === 0) {
        this.ReloadTable();
      }
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
    for (var i in this.invoiceFilter.controls) {
      queryParam[i] = this.invoiceFilter.controls[i].value;
    }
    if (this.auth.vendorId) {
      if (this.flag === 'Inbox') {
        this.router.navigate(
          ['/inbox/inbox-invoices-details/', element.invoiceId],
          {
            queryParams: queryParam,
          }
        );
      } else {
        this.router.navigate(
          ['/inbox/outbox-invoices-details/', element.invoiceId],
          {
            queryParams: queryParam,
          }
        );
      }
    } else {
      if (this.flag === 'Inbox') {
        this.router.navigate(
          ['/hm/inbox/inbox-invoices-details/', element.invoiceId],
          {
            queryParams: queryParam,
          }
        );
      } else {
        this.router.navigate(
          ['/hm/inbox/outbox-invoices-details/', element.invoiceId],
          {
            queryParams: queryParam,
          }
        );
      }
    }
  }
}

export interface PeriodicElement {
  invoiceId: number;
  invoiceDate: string;
  submittedby: string;
  amount: string;
  status: string;
}
