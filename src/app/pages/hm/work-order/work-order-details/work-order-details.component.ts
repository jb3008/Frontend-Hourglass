import { AfterViewInit, ChangeDetectorRef, Component, OnInit, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatSnackBar } from '@angular/material/snack-bar';
import {MatTableDataSource, MatTableModule} from '@angular/material/table';
import { ActivatedRoute } from '@angular/router';
import { catchError } from 'rxjs/internal/operators/catchError';
import { DrawerComponent } from 'src/app/_metronic/kt/components/_DrawerComponent';
import { ToggleComponent } from 'src/app/_metronic/kt/components/_ToggleComponent';
import { ModalComponent, ModalConfig } from 'src/app/_metronic/partials';
import EndPoints from 'src/app/common/endpoints';
import { ApiCallsService } from 'src/app/services/api-calls.service';
import { Utils } from 'src/app/services/utils';
import { Location } from '@angular/common';
import { DomSanitizer } from '@angular/platform-browser';

@Component({
  selector: 'app-work-order-details',
  templateUrl: './work-order-details.component.html',
  styleUrls: ['./work-order-details.component.scss']
})
export class WorkOrderDetailsComponent implements OnInit {

  constructor(private route: ActivatedRoute,private utils: Utils, private snackBar: MatSnackBar, private dialog: MatDialog, private apiCalls: ApiCallsService, private cdr: ChangeDetectorRef,
              private location: Location, private sanitizer: DomSanitizer) { }

  endpoints = EndPoints;
  workOrderID: any;
  loading = false;
  workOrderDetails: any;
  documentsList: any[] = [];
  statusLists: any[] = [];
  taskDetails: any;
  isFromInbox = false;
  dataSource = new MatTableDataSource<any>;
  @ViewChild(MatPaginator) paginator: MatPaginator;
  modalConfig: ModalConfig = {
    modalTitle: 'View Document',
    dismissButtonLabel: 'Cancel',
    closeButtonLabel: 'Save',
    hideFooter: this.hideFooter,
  };
  @ViewChild('modal') private modalComponent: ModalComponent;
  timeSheetFrequencyList: any = {'W': 'Weekly', '2W': 'Bi-Weekly', 'M': 'Monthly'};

  filterObj: FilterObj = {}

  filterValue: FilterValue = {
    priority: 'All Priorities',
    status: 'All Status'
  } as FilterValue;

  ngOnInit(): void {
    this.route.queryParams.subscribe(param => {
      this.workOrderID = param['workOrderId'];
      if(param['from'] == 'inbox'){
        this.isFromInbox = true;
        setTimeout(() => {
          DrawerComponent.reinitialization();
          ToggleComponent.reinitialization();
        }, 0);
      }else{
        this.isFromInbox = false;
      }
    });
    this.getWorkOrderDetails();
    this.getAllStatus();
  }

  
  isSelectedTab:string ='Details';
  getSelectedTab(tab:string): void {
    console.log(tab)
    this.isSelectedTab = tab
    

    setTimeout(() => {
      DrawerComponent.reinitialization();
      ToggleComponent.reinitialization();
    }, 0);

  }

  goBack(){
    this.location.back();
  }

  numbersOnly(event: any){
    return this.utils.numberOnly(event);
  }

  async hideFooter(): Promise<boolean> {
    return true;
  }

  processContent(data: string){
    const parser = new DOMParser();
    const doc = parser.parseFromString(data, 'text/html');
    return doc.documentElement.textContent;
  }

  getWorkOrderDetails(){
    this.loading = true;
    let queryObj = {
      workOrderId: this.workOrderID
    }
    this.apiCalls.get(this.endpoints.ALL_WORK_ORDERS, queryObj)
      .pipe(
        catchError(async (err) => {
          this.utils.showSnackBarMessage(this.snackBar, 'failed to fetch the work order details');
          this.loading = false;
          throw err;
        })
      )
      .subscribe((response) => {
        this.workOrderDetails = response[0];
        this.filterObj.workOrderId = this.workOrderDetails.workOrderId
        this.loading = false;
        this.cdr.detectChanges();
      });
  }

  getDocuments(){
    this.loading = true;
    let queryObj = {
      id : this.workOrderID,
      attachmentType : 'WORK_ORDER'
    }
    this.apiCalls.get(this.endpoints.GET_DOCUMENTS, queryObj)
      .pipe(
        catchError(async (err) => {
          this.utils.showSnackBarMessage(this.snackBar, 'failed to fetch the documents');
          this.loading = false;
          throw err;
        })
      )
      .subscribe((response) => {
        this.documentsList = response;
        this.loading = false;
        this.cdr.detectChanges();
      });
  }
  
  getAttachment(id: string, name: string){
    this.loading = true;
    let queryParam = {
      documentId: id,
    };
    this.apiCalls
      .getDocument(this.endpoints.GET_ATTACHMENT, queryParam)
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
      .getDocument(this.endpoints.GET_ATTACHMENT, queryParam)
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

  getTaskList(obj: any){
    this.loading = true;
    this.apiCalls.get(this.endpoints.TASK_LIST_HM, obj)
      .pipe(
        catchError(async (err) => {
          this.utils.showSnackBarMessage(this.snackBar, 'failed to get the task list');
          this.loading = false;
          this.cdr.detectChanges();
          throw err;
        })
      )
      .subscribe((response) => {
        this.dataSource = new MatTableDataSource<any>(response);
        this.dataSource.paginator = this.paginator;
        this.loading = false;
        this.cdr.detectChanges();
      });
  }

  getAllStatus(){
    this.apiCalls.get(this.endpoints.WORK_ORDER_STATUS)
    .pipe(
      catchError(async (err) => {
        this.utils.showSnackBarMessage(this.snackBar, 'failed to fetch the work order status');
        throw err;
      })
    )
    .subscribe((response) => {
      this.statusLists = response;
      this.cdr.detectChanges();
    });
  }

  applySearchFilter(event: any){
    if(event.target.value){
      this.filterObj.taskId = event.target.value;
      this.getTaskList(this.filterObj);
    }else{
      if (Object.keys(this.filterObj).length > 0) {
        delete this.filterObj.taskId;
        this.getTaskList(this.filterObj);
      } else {
        this.clearSearch('taskId');
      }
    }
  }

  filterByPriority(event: any){
    if(event.value == 'All Priorities'){
      this.filterObj.priority = [];
    }else{
      this.filterObj.priority = event.value;
    }
    this.getTaskList(this.filterObj);
  }

  filterByAssignee(event: any){
    console.log(this.filterObj);
    if(event.target.value && event.target.value.length >= 3){
      this.filterObj.assigneeId = event.target.value;
      this.getTaskList(this.filterObj);
    }else{
      if (Object.keys(this.filterObj).length > 0) {
        delete this.filterObj.assigneeId;
        this.getTaskList(this.filterObj);
      } else {
        this.clearSearch('assigneeId');
      }
    }
  }

  filterByStatus(event: any){
    if(event.value == 'All Status'){
      this.filterObj.status = [];
    }else{
      this.filterObj.status = event.value;
    }
    this.getTaskList(this.filterObj);
  }

  filterByDate(event: any, dateType: 'finishDate'){
    let date = this.changeDateToUtc(event);
    this.filterObj[dateType] = date;
    this.getTaskList(this.filterObj);
  }

  changeDateToUtc(dateObj: any){
    const date = new Date(dateObj);
    const utcDate = date.toISOString();
    return utcDate;
  }

  truncateText(text: string, maxLength: number): string {
    if (!text) return '';
    return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
  }
  
  clearFilters(){
    delete this.filterObj.taskId;
    delete this.filterObj.assigneeId;
    delete this.filterObj.priority;
    delete this.filterObj.finishDate;
    this.filterObj.status = [];
    this.filterObj.priority = [];
    this.filterValue.status = 'All Status';
    this.filterValue.priority = 'All Priorities';
    this.filterValue.taskId = '';
    this.filterValue.assigneeId = '';
    this.filterValue.finishDate = '';
    this.getTaskList(this.filterObj);
  }

  clearSearch(val: keyof FilterObj) {
    delete this.filterObj[val];
    this.getTaskList(this.filterObj);
  }

  editTask(id: string){
    this.loading = true;
    let queryObj = {
      taskId: id
    }
    this.apiCalls.get(this.endpoints.TASK_LIST_HM, queryObj)
      .pipe(
        catchError(async (err) => {
          this.utils.showSnackBarMessage(this.snackBar, 'failed to get the task details');
          this.loading = false;
          this.cdr.detectChanges();
          throw err;
        })
      )
      .subscribe((response) => {
        this.taskDetails = response[0];
        this.loading = false;
        this.cdr.detectChanges();
      });
  }

  deleteTask(id: string){
    let msg = 'Do you want to delete this task?';
    this.utils.showDialogWithCancelButton(this.dialog, msg, (res: any) => {
      this.loading = false;
      if(res){
        this.deleteTheTask(id)
      }
      this.cdr.detectChanges();
    });
  }

  deleteTheTask(id: string){
    this.loading = true;
    let queryObj = {
      id : id
    }
    this.apiCalls.delete(this.endpoints.DELETE_TASK, queryObj)
      .pipe(
        catchError(async (err) => {
          this.utils.showSnackBarMessage(this.snackBar, 'failed to delete the task');
          this.loading = false;
          this.cdr.detectChanges();
          throw err;
        })
      )
      .subscribe((response) => {
        this.loading = false;
        setTimeout(() => {
          this.openSuccessPopup();
        }, 100);
        this.cdr.detectChanges();
      });
  }

  openSuccessPopup(){
    let msg = 'Your Task is successfully deleted';
    this.utils.showDialog(this.dialog, msg, () => {
      this.loading = false;
      this.getTaskList(this.filterObj);
      this.cdr.detectChanges();
    });
  }

  displayedColumns: string[] = ['taskId', 'title', 'priority', 'assigneeId','timeSpent',  'finishDate', 'lastUpdate', 'status', 'action'];
  // dataSource = new MatTableDataSource<PeriodicElement>(ELEMENT_DATA);


}

type FilterValue = {
  taskId?: string,
  priority?: string,
  assigneeId?: string,
  status?: string,
  finishDate?: string
};

type FilterObj = {
  workOrderId?: string,
  taskId?: string,
  priority?: string[],
  assigneeId?: string,
  status?: string[],
  finishDate?: string
};

export interface PeriodicElement {
  taskId: number;
  taskName: string;
  priority: string;
  assignTo: string;
  timeSpent: string;
  eta: string;
  lastUpdate: string;
  status: string;

}

const ELEMENT_DATA: PeriodicElement[] = [
  {taskId: 8865, taskName: 'Some task name that has lengthy characters', priority:'High', assignTo:'Shirley Lopez', timeSpent: '38 hrs', eta: 'Jun 23, 2023', lastUpdate: 'Jun 23, 2023', status: 'In-progress'},
  {taskId: 8865, taskName: 'Some task name that has lengthy characters', priority:'Medium', assignTo:'Shirley Lopez', timeSpent: '38 hrs', eta: 'Jun 23, 2023', lastUpdate: 'Jun 23, 2023', status: 'In-progress'},
  {taskId: 8865, taskName: 'Some task name that has lengthy characters', priority:'Low', assignTo:'Shirley Lopez', timeSpent: '38 hrs', eta: 'Jun 23, 2023', lastUpdate: 'Jun 23, 2023', status: 'In-progress'},
  {taskId: 8865, taskName: 'Some task name that has lengthy characters', priority:'Medium', assignTo:'Shirley Lopez', timeSpent: '38 hrs', eta: 'Jun 23, 2023', lastUpdate: 'Jun 23, 2023', status: 'In-progress'},
  {taskId: 8865, taskName: 'Some task name that has lengthy characters', priority:'High', assignTo:'Shirley Lopez', timeSpent: '38 hrs', eta: 'Jun 23, 2023', lastUpdate: 'Jun 23, 2023', status: 'In-progress'},
  {taskId: 8865, taskName: 'Some task name that has lengthy characters', priority:'Medium', assignTo:'Shirley Lopez', timeSpent: '38 hrs', eta: 'Jun 23, 2023', lastUpdate: 'Jun 23, 2023', status: 'In-progress'},
  {taskId: 8865, taskName: 'Some task name that has lengthy characters', priority:'Low', assignTo:'Shirley Lopez', timeSpent: '38 hrs', eta: 'Jun 23, 2023', lastUpdate: 'Jun 23, 2023', status: 'In-progress'},
  {taskId: 8865, taskName: 'Some task name that has lengthy characters', priority:'High', assignTo:'Shirley Lopez', timeSpent: '38 hrs', eta: 'Jun 23, 2023', lastUpdate: 'Jun 23, 2023', status: 'In-progress'},
  {taskId: 8865, taskName: 'Some task name that has lengthy characters', priority:'Low', assignTo:'Shirley Lopez', timeSpent: '38 hrs', eta: 'Jun 23, 2023', lastUpdate: 'Jun 23, 2023', status: 'In-progress'},

];