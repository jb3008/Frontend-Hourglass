import {AfterViewInit, Component, OnInit, ViewChild } from '@angular/core';
import {SelectionModel} from '@angular/cdk/collections';
import {MatTableDataSource} from '@angular/material/table';
import {MatPaginator} from '@angular/material/paginator';


@Component({
  selector: 'app-invoice-add-timesheet-drawer',
  templateUrl: './invoice-add-timesheet-drawer.component.html',
})
export class InvoiceAddTimesheetDrawerComponent implements OnInit {

  constructor() {}

  ngOnInit(): void {}

  displayedColumns: string[] = ['select', 'taskSheet', 'period', 'workedHr', 'status'];
  dataSource = new MatTableDataSource<PeriodicElement>(ELEMENT_DATA);
  selection = new SelectionModel<PeriodicElement>(true, []);
  
  @ViewChild(MatPaginator) paginator: MatPaginator;

  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
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
  return `${this.selection.isSelected(row) ? 'deselect' : 'select'} row ${row.taskSheet + 1}`;
}




}


export interface PeriodicElement {
  taskSheet: string;
  period:string;
  workedHr:string;
  status:string;
  
}

const ELEMENT_DATA: PeriodicElement[] = [
  {taskSheet: 'HGTS888022',period: 'Jan 02 - Jan 08, 2022',workedHr: '40.0',status: 'Approved'},
  {taskSheet: 'HGTS888022',period: 'Jan 02 - Jan 08, 2022',workedHr: '40.0',status: 'Reject'},
  {taskSheet: 'HGTS888022',period: 'Jan 02 - Jan 08, 2022',workedHr: '40.0',status: 'Approved'},


];
