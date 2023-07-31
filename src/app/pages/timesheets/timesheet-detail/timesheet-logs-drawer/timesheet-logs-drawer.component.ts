import { ChangeDetectorRef, Component, Input, OnInit } from '@angular/core';
import EndPoints from 'src/app/common/endpoints';
import { ApiCallsService } from 'src/app/services/api-calls.service';
import { Utils } from 'src/app/services/utils';
import { Observable, catchError, throwError } from 'rxjs';
import { AuthService } from 'src/app/modules/auth';
import { MatSnackBar } from '@angular/material/snack-bar';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
@Component({
  selector: 'app-timesheet-logs-drawer',
  templateUrl: './timesheet-logs-drawer.component.html',
})
export class TimesheetLogsDrawerComponent implements OnInit {
  constructor(
    private apiCalls: ApiCallsService,
    private utils: Utils,
    private snackBar: MatSnackBar,
    private cdr: ChangeDetectorRef,
    private authService: AuthService,
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private _formBuilder: FormBuilder
  ) {}
  endPoints = EndPoints;
  logs: any;
  @Input() timeSheetId: any;
  ngOnInit(): void {
    this.getAllLogs();
  }
  ngOnChange(): void {
    this.getAllLogs();
  }
  getAllLogs() {
    this.apiCalls
      .get(this.endPoints.GET_TIMESHEET_LOGS, {
        timeSheetId: this.timeSheetId,
      })
      .pipe(
        catchError(async (err) => {
          this.utils.showSnackBarMessage(
            this.snackBar,
            'failed to fetch the time-sheet logs'
          );
          throw err;
        })
      )
      .subscribe((response) => {
        this.logs = response;

        this.cdr.detectChanges();
      });
  }
}
