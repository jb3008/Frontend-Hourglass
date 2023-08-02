import { ChangeDetectorRef, Component, Input, OnChanges, OnInit, ViewChild } from '@angular/core';
import {SelectionModel} from '@angular/cdk/collections';
import {MatTableDataSource} from '@angular/material/table';
import { ApiCallsService } from 'src/app/services/api-calls.service';
import EndPoints from 'src/app/common/endpoints';
import { catchError } from 'rxjs/internal/operators/catchError';
import { Utils } from 'src/app/services/utils';
import { MatDialog } from '@angular/material/dialog';
import { ModalConfig, ModalComponent } from 'src/app/_metronic/partials';

@Component({
  selector: 'app-application-drawer',
  templateUrl: './application-drawer.component.html',
})
export class ApplicationDrawerComponent implements OnInit, OnChanges {

  displayedColumns: string[] = ['select', 'timesheet',  'period','workerhr', 'status'];
  dataSource = new MatTableDataSource<PeriodicElement>(ELEMENT_DATA);
  @Input() applicationDetails: any;
  @Input() jobDetails: any;
  @Input() applicantsDetails: any;
  @Input() isSelectedTab: any;
  @Input() profilePic: any;
  @Input() applicationAttachement: any;
  loading = false;
  endPoints = EndPoints;

  modalConfig: ModalConfig = {
    modalTitle: 'View Document',
    dismissButtonLabel: 'Cancel',
    closeButtonLabel: 'Save',
    hideFooter: this.hideFooter,
  };
  @ViewChild('modal') private modalComponent: ModalComponent;
  
  constructor(private apiCalls: ApiCallsService, private cdr: ChangeDetectorRef, private utils: Utils, private dialog: MatDialog) {}

  ngOnInit(): void {
  }

  ngOnChanges(change: any){
    if(change?.applicationDetails?.currentValue?.length > 0){
      this.applicationDetails = change.applicationDetails.currentValue;
      // this.getApplicantDocuments(this.applicationDetails.id);
    }
    if(change?.applicationAttachement?.currentValue?.length > 0){
      this.applicationAttachement = change.applicationAttachement.currentValue;
    }
    if(change?.isSelectedTab?.currentValue){
      this.isSelectedTab = change.isSelectedTab.currentValue;
    }
    if(change?.jobDetails?.currentValue){
      this.jobDetails = change.jobDetails.currentValue;
    }
    if(change?.applicantsDetails?.currentValue){
      this.applicantsDetails = change.applicantsDetails.currentValue;
    }
    if(change?.profilePic?.currentValue){
      this.profilePic = change.profilePic.currentValue;
    }
  }

  async hideFooter(): Promise<boolean> {
    return true;
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

  getAttachment(id: string, name: string){
    this.loading = true;
    let queryParam = {
      documentId: id,
    };
    this.apiCalls
      .getDocument(this.endPoints.GET_ATTACHMENT, queryParam)
      .pipe(
        catchError(async (error) => {
          this.loading = false;
          this.cdr.detectChanges();
          throw error;
        })
      )
      .subscribe((response) => {
        const url = window.URL.createObjectURL(response);
        const anchor = document.createElement('a');
        anchor.href = url;
        anchor.download = name;
        anchor.click();
        window.URL.revokeObjectURL(url);
        this.loading = false;
        this.cdr.detectChanges();
      });
  }

  pdfSrc = '';
  async openModal(documentId: any) {
    let queryParam = {
      documentId: documentId,
    };
    this.apiCalls
      .getDocument(this.endPoints.GET_ATTACHMENT, queryParam)
      .pipe(
        catchError(async (error) => {
          this.cdr.detectChanges();
          throw error;
        })
      )
      .subscribe(async (response) => {
        const src = window.URL.createObjectURL(response);
        this.pdfSrc = src;
        this.cdr.detectChanges();
        return await this.modalComponent.open();
      });
  }
  
  updateStatus(id: string, status: string){
    let msg = `Do you want to ${status} the offer ?`;
    this.utils.showDialogWithCancelButton(this.dialog, msg, (res: any) => {
      if(res){
        this.actionOnOfferLetter(id, status)
      }
      this.cdr.detectChanges();
    });
  }

  actionOnOfferLetter(id: string, status: string){
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
        setTimeout(() => {
          this.openSuccessPopup(status);
        }, 100);
        this.cdr.detectChanges();
      })
  }

  openSuccessPopup(status: any){
    let msg = `Offer letter ${status} successfully`
    this.utils.showDialog(this.dialog, msg, () => {
      this.loading = false;
      let closeBtn = document.getElementById('kt_application_close');
      closeBtn?.click();
      this.cdr.detectChanges();
    });
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

  getDocIcon(fileName: string) {
    return this.utils.getDocIcon(fileName)
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