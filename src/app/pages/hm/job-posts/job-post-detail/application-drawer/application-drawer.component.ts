import { ChangeDetectorRef, Component, Input, OnChanges, OnInit } from '@angular/core';
import {SelectionModel} from '@angular/cdk/collections';
import {MatTableDataSource} from '@angular/material/table';
import { ApiCallsService } from 'src/app/services/api-calls.service';
import EndPoints from 'src/app/common/endpoints';
import { catchError } from 'rxjs/internal/operators/catchError';

@Component({
  selector: 'app-application-drawer',
  templateUrl: './application-drawer.component.html',
})
export class ApplicationDrawerComponent implements OnInit, OnChanges {

  displayedColumns: string[] = ['select', 'timesheet',  'period','workerhr', 'status'];
  dataSource = new MatTableDataSource<PeriodicElement>(ELEMENT_DATA);
  @Input() applicationDetails: any;
  @Input() isSelectedTab: any;
  loading = false;
  endPoints = EndPoints;
  
  constructor(private apiCalls: ApiCallsService, private cdr: ChangeDetectorRef) {}

  ngOnInit(): void {
    console.log(this.applicationDetails);
    
  }

  ngOnChanges(change: any){
    if(change?.applicationDetails?.currentValue.length > 0){
      this.applicationDetails = change.applicationDetails.currentValue;
      // this.getApplicantDocuments(this.applicationDetails.id);
    }
    if(change?.isSelectedTab?.currentValue){
      this.isSelectedTab = change.isSelectedTab.currentValue;
    }
  }

  getApplicantDocuments(id: string){
    this.loading = true;
    let queryParam = {
      jobApplicationId : id
    }
    this.apiCalls.get(this.endPoints.APPLICATION_DOCUMENTS, queryParam)
      .pipe(catchError(async (error) => {
        console.log(error);
        this.loading = false;
        throw error;
      }))
      .subscribe((response) => {
        this.loading = false;
      })
  }

  updateStatus(id: string, status: string){
    this.loading = true;
    let queryParam = {
      jobApplicationId : id,
      newStatus: status
    }
    this.apiCalls.post(this.endPoints.UPDATE_APPL_STATUS, '', queryParam)
      .pipe(catchError(async (error) => {
        this.loading = false;
        this.cdr.detectChanges();
        console.log(error);
        throw error;
      }))
      .subscribe((response) => {
        this.loading = false;
        this.cdr.detectChanges();
      })
  }

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