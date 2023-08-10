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

  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;
  auth: any;
  ngAfterViewInit() {}
  ngOnInit(): void {
    this.isApiLoad = false;
    this.auth = this.utils.getAuth();
    this.invoiceFilter = this.fb.group({
      invoiceId: [''],
      invoiceDate: [''],
      status: ['All'],
    });
    this.getAllInvoice();
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

    this.apiCalls
      .get(this.getEndpoint(), filter)
      .pipe(
        catchError(async (err) => {
          this.utils.showSnackBarMessage(
            this.snackBar,
            'failed to fetch the invoices notification'
          );
          this.dataSource = new MatTableDataSource<any>([]);
          this.dataSource.paginator = this.paginator;
          this.dataSource.sort = this.sort;
          this.isLoading = false;
          this.isApiLoad = true;
          this.cdr.detectChanges();
          throw err;
        })
      )
      .subscribe((response) => {
        this.invoiceList = response;
        console.log(response);

        for (let index = 0; index < response.length; index++) {
          const element = response[index];
        }

        this.dataSource = new MatTableDataSource<any>(response);
        this.dataSource.paginator = this.paginator;
        this.dataSource.sort = this.sort;
        this.isLoading = false;
        this.isApiLoad = true;
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
