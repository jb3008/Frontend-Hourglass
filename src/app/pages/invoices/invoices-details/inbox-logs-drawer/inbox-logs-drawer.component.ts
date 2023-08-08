import {
  ChangeDetectorRef,
  Component,
  Input,
  OnChanges,
  OnInit,
  SimpleChanges,
} from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import InlineEditor from '@ckeditor/ckeditor5-build-inline';
import { catchError } from 'rxjs';
import EndPoints from 'src/app/common/endpoints';
import { ApiCallsService } from 'src/app/services/api-calls.service';
import { Utils } from 'src/app/services/utils';

@Component({
  selector: 'app-inbox-invoice-logs-drawer',
  templateUrl: './inbox-logs-drawer.component.html',
})
export class InboxInvoiceLogsDrawerComponent implements OnInit, OnChanges {
  constructor(
    private apiCalls: ApiCallsService,
    private utils: Utils,
    private snackBar: MatSnackBar,
    private cdr: ChangeDetectorRef
  ) {}

  @Input() workOrderId: any;
  endPoints = EndPoints;
  logs: any[] = [];

  ngOnInit(): void {}

  ngOnChanges(changes: SimpleChanges): void {
    if (changes?.workOrderId?.currentValue) {
      this.getLogs(changes.workOrderId.currentValue);
    }
  }

  getLogs(id: string) {
    let queryParam = {
      workOrderId: id,
    };

    this.apiCalls
      .get(this.endPoints.GET_WORKORDER_LOGS, queryParam)
      .pipe(
        catchError(async (err) => {
          this.utils.showSnackBarMessage(
            this.snackBar,
            'failed to fetch the work order logs'
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
