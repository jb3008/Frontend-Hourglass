import { Component, OnInit } from '@angular/core';
import {SelectionModel} from '@angular/cdk/collections';
import {MatTableDataSource} from '@angular/material/table';

@Component({
  selector: 'app-add-invoice-drawer',
  templateUrl: './add-invoice-drawer.component.html',
})
export class AddInvoiceDrawerComponent implements OnInit {

  displayedColumns: string[] = ['select', 'timesheet',  'period','workerhr', 'status'];
  dataSource = new MatTableDataSource<PeriodicElement>(ELEMENT_DATA);

  constructor() {}

  ngOnInit(): void {}




  selection = new SelectionModel<PeriodicElement>(true, []);
  
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
    return `${this.selection.isSelected(row) ? 'deselect' : 'select'} row ${row.timesheet + 1}`;
  }


}




export interface PeriodicElement {
  timesheet: string;
  period: string;
  workerhr: number;
  status: string;
}

const ELEMENT_DATA: PeriodicElement[] = [
  {timesheet: 'HGIN888022',  period:'Jan 02 - Jan 08, 2022', workerhr: 40.0, status:'In-progress'},
  {timesheet: 'HGIN888022',  period:'Jan 02 - Jan 08, 2022', workerhr: 40.0, status:'Approved'},
  {timesheet: 'HGIN888022',  period:'Jan 02 - Jan 08, 2022', workerhr: 40.0, status:'In-progress'},

  
];