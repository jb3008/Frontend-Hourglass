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
      this.sortBy = param['sortBy'] ? param['sortBy'] : 'invoiceId';
      this.flag = param['flag'] ? param['flag'] : this.flag;
      this.isSelectedTab = this.flag;
      this.sortOrder = param['sortOrder'] ? param['sortOrder'] : 'desc';
      this.sort.active = this.sortBy;
      this.sort.direction = this.sortOrder === 'desc' ? 'desc' : 'asc';

      this.getAllInvoice();
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
    // this.getAllInvoice();
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
    this.paginator.pageIndex = 0;
    this.sort.active = 'invoiceId';
    this.sort.direction = 'desc';
    this.paginator.pageSize = 10;
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
  // getAllInvoice() {
  //   this.isLoading = true;
  //   this.isApiLoad = false;
  //   let filter: any = {};
  //   if (this.invoiceFilter.controls['status'].value !== 'All') {
  //     filter.status = [this.invoiceFilter.controls['status'].value];
  //   }
  //   if (this.invoiceFilter.controls['invoiceId'].value) {
  //     filter.invoiceId = this.invoiceFilter.controls['invoiceId'].value;
  //   }
  //   if (this.invoiceFilter.controls['invoiceDate'].value) {
  //     filter.invoiceDate = this.changeDateToUtc(
  //       this.invoiceFilter.controls['invoiceDate'].value
  //     );
  //   }

  //   this.apiCalls
  //     .get(this.getEndpoint(), filter)
  //     .pipe(
  //       catchError(async (err) => {
  //         this.utils.showSnackBarMessage(
  //           this.snackBar,
  //           'failed to fetch the invoices notification'
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
  //       this.invoiceList = response;
  //       console.log(response);

  //       for (let index = 0; index < response.length; index++) {
  //         const element = response[index];
  //       }

  //       this.dataSource = new MatTableDataSource<any>(response);
  //       this.dataSource.paginator = this.paginator;
  //       this.dataSource.sort = this.sort;
  //       this.isLoading = false;
  //       this.isApiLoad = true;
  //       this.cdr.detectChanges();
  //     });
  // }

  getAllInvoice() {
    this.isLoading = true;
    this.isApiLoad = false;
    let filter: any = {};
    if (this.invoiceFilter.controls['status'].value !== 'All') {
      filter.status = [this.invoiceFilter.controls['status'].value];
    }
    if (this.invoiceFilter.controls['invoiceId'].value) {
      filter.invoiceId = this.invoiceFilter.controls['invoiceId'].value;
    }
    if (this.invoiceFilter.controls['invoiceDate'].value) {
      filter.invoiceDate = this.changeDateToUtc(
        this.invoiceFilter.controls['invoiceDate'].value
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

            case 'submittedby':
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
            .get(this.getEndpoint(), filter)
            .pipe(catchError(() => observableOf(null)));
        }),
        map((data) => {
          return data;
        })
      )
      .subscribe((response) => {
        this.apiCalls
          .get(this.getEndpointCount(), filter)
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
        this.getAllInvoice();
      } else if (event.target.value.length === 0) {
        this.getAllInvoice();
      }
    });
  }
}

export interface PeriodicElement {
  invoiceId: number;
  invoiceDate: string;
  submittedby: string;
  amount: string;
  status: string;
}
