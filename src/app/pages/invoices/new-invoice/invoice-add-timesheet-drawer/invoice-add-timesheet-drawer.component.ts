import {
  ChangeDetectorRef,
  AfterViewInit,
  Component,
  OnInit,
  Input,
  Output,
  EventEmitter,
  ViewChild,
} from '@angular/core';
import { SelectionModel } from '@angular/cdk/collections';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';

import EndPoints from 'src/app/common/endpoints';
import { ApiCallsService } from 'src/app/services/api-calls.service';
import { Utils } from 'src/app/services/utils';
import { AuthService } from 'src/app/modules/auth';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Observable, catchError, throwError } from 'rxjs';
import { MatDialog } from '@angular/material/dialog';
@Component({
  selector: 'app-invoice-add-timesheet-drawer',
  templateUrl: './invoice-add-timesheet-drawer.component.html',
})
export class InvoiceAddTimesheetDrawerComponent implements OnInit {
  constructor(
    private dialog: MatDialog,
    private apiCalls: ApiCallsService,
    private utils: Utils,
    private snackBar: MatSnackBar,
    private cdr: ChangeDetectorRef,
    private authService: AuthService
  ) {}

  displayedColumns: string[] = [
    'select',
    'taskSheet',
    'period',
    'workedHr',
    'status',
  ];
  endPoints = EndPoints;
  isLoading = false;
  dataSource = new MatTableDataSource<PeriodicElement>([]);
  selection = new SelectionModel<PeriodicElement>(true, []);
  @Input() workOrderId: any;
  @Input() selectedTask: any = [];
  @Output() getSelectedTimesheetList = new EventEmitter<any>();

  @ViewChild(MatPaginator) paginator: MatPaginator;

  ngOnInit(): void {}
  AfterViewInit() {
    this.dataSource.paginator = this.paginator;
  }

  ngOnChanges() {
    console.log('CALL CHANGE');
    if (this.workOrderId) {
      this.getTimesheetList();
    }
    this.selection.clear();
    this.cdr.detectChanges();
  }

  /** Whether the number of selected elements matches the total number of rows. */
  isAllSelected() {
    const numSelected = this.selection.selected.length;
    const numRows = this.dataSource.data.length;
    return numSelected === numRows;
  }

  /** Selects all rows if they are not all selected; otherwise clear selection. */
  toggleAllRows() {
    console.log(this.dataSource.data);
    if (this.isAllSelected()) {
      this.selection.clear();
      return;
    }

    this.selection.select(...this.dataSource.data);
  }

  /** The label for the checkbox on the passed row */
  checkboxLabel(row?: PeriodicElement): string {
    if (!row) {
      return `${this.isAllSelected() ? 'deselect' : 'select'} all`;
    }
    return `${this.selection.isSelected(row) ? 'deselect' : 'select'} row ${
      row.taskSheet + 1
    }`;
  }

  getTimesheetList() {
    this.isLoading = true;
    this.apiCalls
      .get(this.endPoints.TIMESHEET_LIST_FOR_INVOICE, {
        workOrderId: this.workOrderId,
      })
      .pipe(
        catchError(async (err) => {
          this.utils.showErrorDialog(this.dialog, err);
          this.isLoading = false;
          this.cdr.detectChanges();
          throw err;
        })
      )
      .subscribe((response) => {
        for (let index = 0; index < response.length; index++) {
          const element = response[index];
          element.timeSpent = 0;

          for (let i = 0; i < element.taskListDetails.length; i++) {
            element.timeSpent += element.taskListDetails[i].timeSpent
              ? parseInt(element.taskListDetails[i].timeSpent)
              : 0;
          }
        }
        this.dataSource = new MatTableDataSource<any>(response.list);
        this.dataSource.paginator = this.paginator;
        this.isLoading = false;
        this.cdr.detectChanges();
      });
  }

  continue() {
    this.getSelectedTimesheetList.emit(this.selection?.selected);
    this.isLoading = false;
    let closeBtn = document.getElementById('kt_invoice_add_timesheet_close');
    closeBtn?.click();
    this.cdr.detectChanges();
    // this.selection.clear();
  }
}

export interface PeriodicElement {
  taskSheet: string;
  period: string;
  workedHr: string;
  status: string;
}
