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
import { DrawerComponent } from 'src/app/_metronic/kt/components';
import { ActivatedRoute } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';

@Component({
  selector: 'app-invoices-details',
  templateUrl: './invoices-details.component.html',
  styleUrls: ['./invoices-details.component.scss'],
})
export class InvoicesDetailsComponent implements OnInit {
  endPoints = EndPoints;
  invoiceDetails: any = {};
  isLoading = false;
  auth: any;
  invoiceId: any;
  queryParamData: any;
  constructor(
    private apiCalls: ApiCallsService,
    private utils: Utils,
    private snackBar: MatSnackBar,
    private cdr: ChangeDetectorRef,
    private authService: AuthService,
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private dialog: MatDialog
  ) {}

  ngOnInit(): void {
    this.route.queryParams.subscribe((param) => {
      this.queryParamData = param;
      this.auth = this.utils.getAuth();
      this.invoiceId = this.route.snapshot.paramMap.get('invoiceId');
      this.getAllInvoice();
    });
  }

  ngAfterViewInit() {
    DrawerComponent.reinitialization();
  }

  getAllInvoice() {
    this.isLoading = true;

    this.apiCalls
      .get(this.endPoints.GET_INVOICE, {
        invoiceId: this.invoiceId,
      })
      .pipe(
        catchError(async (err) => {
          this.utils.showErrorDialog(this.dialog, err);
          this.isLoading = false;
          this.invoiceDetails = null;
          this.cdr.detectChanges();
          throw err;
        })
      )
      .subscribe((response) => {
        this.invoiceDetails = response ? response.list[0] : null;
        if (this.invoiceDetails) {
          this.invoiceDetails.taxAmount = this.percentage(
            this.invoiceDetails?.totalAmount || 0,
            this.invoiceDetails?.taxPercentage || 0
          );
          this.invoiceDetails.subAmount =
            this.invoiceDetails?.totalAmount ||
            0 - this.invoiceDetails?.taxPercentage ||
            0;
        }
        this.isLoading = false;
        this.cdr.detectChanges();
      });
  }

  percentage(percent: number, total: number) {
    return ((percent / 100) * total).toFixed(2);
  }
}
