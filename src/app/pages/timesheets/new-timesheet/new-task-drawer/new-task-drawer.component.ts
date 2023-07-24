import {
  AfterViewInit,
  ChangeDetectorRef,
  Component,
  EventEmitter,
  Input,
  OnInit,
  Output,
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
  selector: 'app-new-task-drawer',
  templateUrl: './new-task-drawer.component.html',
})
export class NewTaskDrawerComponent implements OnInit {
  constructor(
    private dialog: MatDialog,
    private apiCalls: ApiCallsService,
    private utils: Utils,
    private snackBar: MatSnackBar,
    private cdr: ChangeDetectorRef,
    private authService: AuthService
  ) {}
  endPoints = EndPoints;
  isLoading = false;
  displayedColumns: string[] = ['select', 'title'];
  dataSource = new MatTableDataSource<any>();
  selection = new SelectionModel<PeriodicElement>(true, []);

  @ViewChild(MatPaginator) paginator: MatPaginator;

  @Input() workOrderId: any;
  @Input() selectedEmpObj: any;

  @Output() getSelectedTaskList = new EventEmitter<any>();
  ngOnInit(): void {
    this.selection.clear();
    this.cdr.detectChanges();
  }
  ngOnChanges() {
    if (this.workOrderId) {
      this.getAllTaskForWorkOrders();
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
      row.title + 1
    }`;
  }

  getAllTaskForWorkOrders() {
    this.isLoading = true;
    this.apiCalls
      .get(this.endPoints.GET_TASK_FOR_WORK_ORDER_LIST, {
        workOrderId: this.workOrderId,
      })
      .pipe(
        catchError(async (err) => {
          this.utils.showSnackBarMessage(
            this.snackBar,
            'failed to fetch the work orders'
          );
          this.isLoading = false;
          this.cdr.detectChanges();
          throw err;
        })
      )
      .subscribe((response) => {
        this.dataSource = new MatTableDataSource<any>(response);
        this.dataSource.paginator = this.paginator;
        this.isLoading = false;
        this.cdr.detectChanges();
      });
  }
  continue() {
    this.isLoading = false;
    let closeBtn = document.getElementById('kt_new_task_close');
    closeBtn?.click();
    this.cdr.detectChanges();
    this.getSelectedTaskList.emit(this.selection?.selected);
  }
  applyFilter(event: any) {
    this.dataSource.filter = event.target.value.trim().toLowerCase();
    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }
}

export interface PeriodicElement {
  title: string;
}
