import {
  ChangeDetectorRef,
  Component,
  EventEmitter,
  Input,
  OnChanges,
  OnInit,
  Output,
} from '@angular/core';
import EndPoints from 'src/app/common/endpoints';
import { ApiCallsService } from 'src/app/services/api-calls.service';
import { Utils } from 'src/app/services/utils';
import { Observable, catchError, throwError } from 'rxjs';
import { AuthService } from 'src/app/modules/auth';
import { MatSnackBar } from '@angular/material/snack-bar';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';

@Component({
  selector: 'app-inbox-invoice-logs-drawer',
  templateUrl: './inbox-logs-drawer.component.html',
})
export class InboxInvoiceLogsDrawerComponent implements OnInit {
  constructor(
    private apiCalls: ApiCallsService,
    private utils: Utils,
    private snackBar: MatSnackBar,
    private cdr: ChangeDetectorRef,
    private authService: AuthService,
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private _formBuilder: FormBuilder,
    private dialog: MatDialog,
  ) {}
  endPoints = EndPoints;
  logs: any;
  @Input() invoiceId: any;
  @Output() reloadPage = new EventEmitter<any>();
  ngOnInit(): void {
    this.getAllLogs();
  }
  ngOnChange(): void {
    this.getAllLogs();
  }
  getAllLogs() {
    this.apiCalls
      .get(this.endPoints.GET_INVOICE_LOGS, {
        invoiceId: this.invoiceId,
      })
      .pipe(
        catchError(async (err) => {
          this.utils.showErrorDialog(this.dialog, err);
          throw err;
        })
      )
      .subscribe((response) => {
        this.logs = response;

        this.cdr.detectChanges();
      });
  }
}
