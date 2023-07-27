import { AfterViewInit,ChangeDetectorRef,Component, OnInit, ViewChild } from '@angular/core';
import {MatTableDataSource, MatTableModule} from '@angular/material/table';
import InlineEditor from '@ckeditor/ckeditor5-build-inline';
import { DrawerComponent, ToggleComponent } from 'src/app/_metronic/kt/components';
import {MatPaginator} from '@angular/material/paginator';
import {MatSort} from '@angular/material/sort';
import { HttpParams } from '@angular/common/http';
import { Observable, catchError, throwError } from 'rxjs';
import { ApiCallsService } from 'src/app/services/api-calls.service';
import EndPoints from 'src/app/common/endpoints';
import { Utils } from 'src/app/services/utils';
import { MatSnackBar } from '@angular/material/snack-bar';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
@Component({
  selector: 'app-new-work-order',
  templateUrl: './new-work-order.component.html',
  styleUrls: ['./new-work-order.component.scss']
})
export class NewWorkOrderComponent implements OnInit, AfterViewInit {

  constructor(private fb: FormBuilder, private apiCalls: ApiCallsService, private utils: Utils, private snackBar: MatSnackBar,
    private dialog: MatDialog, private router: Router, private cdr: ChangeDetectorRef) { }

  endpoints = EndPoints;
  hiringManager: any[] = [];
  jobTypes: any[] = [];
  timesheetFrequency: any[] = [];
  costCenterList: any[] = [];
  payTerms: any[] = [];
  legalEntities: any[] = [];
  siteList: any[] = [];
  businessUnits: any[] = [];
  jobLists: any[] = [];
  vendorList: any[] = [];
  workOrderKind = 'Hourly';
  workOrderData: FormGroup;
  
  ngOnInit(): void {
    this.workOrderData = this.fb.group({
      title: ['', Validators.required],
      description: ['', Validators.required],
      hiringManager: ['', Validators.required],
      priority: ['Medium'],
      type: ['', Validators.required],
      vendor: [''],
      jobPostId: [''],
      startDate: ['', Validators.required],
      kind: ['', Validators.required],
      endDate: ['', Validators.required],
      timesheetFreq: ['Weekly (Default)', Validators.required],
      workHourInterval: ['', Validators.required],
      workHours: ['', Validators.required],
      costCenter: ['', Validators.required],
      payTerms: ['30', Validators.required],
      legalEntity: ['', Validators.required],
      workRate: [''],
      minBudget: [''],
      maxBudget: [''],
      workRateCurrency: ['', Validators.required],
      site: ['', Validators.required],
      location: [{value: '', disabled: true}, Validators.required],
      businessUnit: ['', Validators.required],
      documentList: [[]],
    });
    
    const userId = this.utils.getUser()!;
    // this.getUserByUserId(userId);
    this.vendorsList();
    this.getHiringManagers();
    this.getAllJobs();
    this.getJobType();
    this.getTimeSheetFrequency();
    this.getCostCenter();
    this.getPaymenTerms();
    this.getLegalEntities();
  }

  getHiringManagers(){
    this.getDropDownValues(this.endpoints.HIRING_MANGER).subscribe({
      next: response => {
        this.hiringManager = response
      },
      error: error => {
        console.log(error);
      }
    })
  }

  getJobType(){
    this.getDropDownValues(this.endpoints.JOB_TYPE).subscribe({
      next: response => {
        this.jobTypes = response
      },
      error: error => {
        console.log(error);
      }
    })
  }

  getTimeSheetFrequency(){
    this.getDropDownValues(this.endpoints.TIMESHEET_FREQ).subscribe({
      next: response => {
        this.timesheetFrequency = response;
      },
      error: error => {
        console.log(error);
      }
    })
  }

  getCostCenter(){
    this.getDropDownValues(this.endpoints.COST_CENTER).subscribe({
      next: response => {
        this.costCenterList = response;
      },
      error: error => {
        console.log(error);
      }
    })
  }

  getPaymenTerms(){
    this.getDropDownValues(this.endpoints.PAY_TERMS).subscribe({
      next: response => {
        this.payTerms = response;
      },
      error: error => {
        console.log(error);
      }
    })
  }

  getLegalEntities(){
    this.getDropDownValues(this.endpoints.LEGAL_ENTITY).subscribe({
      next: response => {
        this.legalEntities = response;
      },
      error: error => {
        console.log(error);
      }
    })
  }

  getLegalEntityCode(event: any){
    this.workOrderData.controls['site'].setValue(null);
    this.workOrderData.controls['businessUnit'].setValue(null);
    this.workOrderData.controls['location'].setValue(null);
    this.getPlantsList(event.value);
    this.getBusinessUnits(event.value);
  }

  getPlantsList(companyCode: string){
    this.getDropDownValues(this.endpoints.PLANT_LIST, companyCode).subscribe({
      next: response => {
        this.siteList = response;
      },
      error: error => {
        console.log(error);
      }
    })
  }

  getBusinessUnits(companyCode: string){
    this.getDropDownValues(this.endpoints.BUSINESS_UNIT, companyCode).subscribe({
      next: response => {
        this.businessUnits = response;
      },
      error: error => {
        console.log(error);
      }
    })
  }

  getDropDownValues(endpoint: any, companyCode?: string): Observable<any> {
    let queryParams;
    if(companyCode){
      queryParams = new HttpParams().set('companyCode', companyCode);
    }
    return this.apiCalls.get(endpoint, queryParams)
      .pipe(catchError((err) => {
        return throwError(() => err);
      }));
  }

  getUserByUserId(id: string){
    const queryParam = {
      userId: id
    }
    this.apiCalls.get(this.endpoints.GET_USER, queryParam)
      .pipe(
        catchError(async (err) => {
          this.utils.showSnackBarMessage(this.snackBar, 'failed to fetch the user');
          throw err;
        })
      )
      .subscribe((response) => {
        // this.vendorsList(response.vendorId);
      });
  }
  
  vendorsList(){
    this.apiCalls.get(this.endpoints.GET_VENDORS_LIST)
      .pipe(
        catchError(async (err) => {
          this.utils.showSnackBarMessage(this.snackBar, 'failed to fetch the vendors');
          throw err;
        })
      )
      .subscribe((response) => {
        this.vendorList = response;
      });
  }

  getAllJobs(){
    let queryParam = {
      status: 'ACTIVE'
    }
    this.apiCalls.get(this.endpoints.LIST_JOBS, queryParam)
      .pipe(
        catchError(async (err) => {
          this.utils.showSnackBarMessage(this.snackBar, 'failed to fetch the jobs');
          throw err;
        })
      )
      .subscribe((response) => {
        this.jobLists = response;
      });
  }

  selectFile(event: any){
    const file = event.target.files[0];
    if(file.type.indexOf('image') == 0){
      this.utils.showSnackBarMessage(this.snackBar, 'Please upload documents only');
    } else if (file.size > 2 * 1024 * 1024) { // check if file size is > 2 MB
      this.utils.showSnackBarMessage(this.snackBar, 'Maximum allowed file size is 2 MB. Please choose another file.');
    } else {
      const docList = this.workOrderData.controls['documentList'].value;
        if (docList.length < 6) {
          if (this.utils.isFileExist(docList, file)) {
            this.utils.showSnackBarMessage(this.snackBar, 'This file "' + file.name + '" already exist.');
          } else {
            this.workOrderData.controls['documentList'].value.push(file);
          }
        } else {
          this.utils.showSnackBarMessage(this.snackBar, 'Maximum 6 files can be added.');
        }
    }
  }

  clearFile(index: number) {
    this.workOrderData.controls['documentList'].value.splice(index, 1);
  }

  clearFileInput(element: any) {
    this.utils.clearFileInput(element);
  }

  changeInputValue(action: string){
    let value = this.workOrderData.get('workHours')?.value
    if(action == '-'){
      if(value == 1)
        return;
      this.workOrderData.controls['workHours'].setValue(--value);
    }else if(action == '+'){
      this.workOrderData.controls['workHours'].setValue(++value);
    }
    
  }

  setLocationValue(event: any){
    this.workOrderData.controls['site'].setValue(event.value.code);
    this.workOrderData.controls['location'].setValue(event.value.city);
  }

  changeRateValue(){
    if(this.workOrderKind == 'Fixed'){
      this.workOrderData.controls['workRate'].setValue(null);
    }else{
      this.workOrderData.controls['minBudget'].setValue(null);
      this.workOrderData.controls['maxBudget'].setValue(null);
    }
  }

  isLoading = false;
  submitWorkOrder(status: string){
    const formData = new FormData();
    let workRateValue = this.workOrderData.controls['workRate'].value;
    let minBudget = this.workOrderData.controls['minBudget'].value;
    let maxBudget = this.workOrderData.controls['maxBudget'].value;
    if(this.workOrderData.valid && (workRateValue || (minBudget && maxBudget))){
      this.isLoading = true;
      this.workOrderData.controls['startDate'].setValue(this.changeDateToUtc(this.workOrderData.controls['startDate'].value))
      this.workOrderData.controls['endDate'].setValue(this.changeDateToUtc(this.workOrderData.controls['endDate'].value));

      for (const key of Object.keys(this.workOrderData.value) ) {
        if(key !== 'documentList'){
          const value = this.workOrderData.value[key];
          formData.append(key, value);
        }else{
          const file = this.workOrderData.value['documentList'];
          if(file.length != 0){
            file.forEach((fileObj: File) => {
              const blob = new Blob([fileObj], { type: fileObj.type });
              formData.append(key, blob, fileObj.name);
            })
          }
        }
      }

      if (this.workOrderKind == 'Fixed') {
        formData.delete('workRate');  
        formData.append('workRate', '0');  
      } else if (this.workOrderKind == 'Hourly') {
        formData.delete('minBudget');  
        formData.append('minBudget', '0');  
        formData.delete('maxBudget');  
        formData.append('maxBudget', '0');  
      }

      formData.append('status', status);

      this.apiCalls.post(this.endpoints.CREATE_WORK_ORDER,formData)
      .pipe(catchError(async (err) => {
        this.isLoading = false;
        setTimeout(() => {
          throw err;  
        }, 10);
        
      }))
      .subscribe(response => {
        if (this.isLoading) { // isLoading = true indicates no error.
          this.openSuccessPopup(status);
        }
      })
    }else{
      this.utils.showSnackBarMessage(this.snackBar, 'Please enter all required data');
    }
  }

  openSuccessPopup(status: string){
    let msg;
    if(status == 'ACTIVE'){
      msg = 'Your Work Order is successfully created'
    }

    this.utils.showDialog(this.dialog, msg, () => {
      this.isLoading = false;
      this.router.navigate(['/hm/work-order']);
    });
  }

  changeDateToUtc(dateObj: any){
    const date = new Date(dateObj);
    const utcDate = date.toISOString()
    return utcDate;
  }

  getTaskList(obj?: any){
    this.isLoading = true;
    this.apiCalls.get(this.endpoints.TASK_LIST_HM, obj)
      .pipe(
        catchError(async (err) => {
          this.utils.showSnackBarMessage(this.snackBar, 'failed to get the task list');
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

  editor = InlineEditor;
  // data: any = `<p>Hello, world!</p>`;
  data: any = '';

  displayedColumns: string[] = ['taskId', 'title', 'priority', 'assigneeId', 'startDate', 'finishDate'];
  dataSource = new MatTableDataSource<any>;


  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;

  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  isSelectedTab:string ='Details';
  getSelectedTab(tab:string): void {
    console.log(tab)
    this.isSelectedTab = tab
    

  
    setTimeout(() => {
      DrawerComponent.reinitialization();
      ToggleComponent.reinitialization();

      this.dataSource.paginator = this.paginator;
      this.dataSource.sort = this.sort;

    }, 0);

  }



  allFiles: File[] = []; 
  droppedFiles(allFiles: File[]): void {
    console.log('this.allFiles')
    const filesAmount = allFiles.length;
    for (let i = 0; i < filesAmount; i++) {
      const file = allFiles[i];
      this.allFiles.push(file);
    }
    console.log(this.allFiles)
  }

   onReady(eventData:any) {
    eventData.plugins.get('FileRepository').createUploadAdapter = function (loader:any) {
      console.log('loader : ', loader)
      console.log(btoa(loader.file));
      // return new UploadAdapter(loader);
    };
  }

}




export interface PeriodicElement {
  taskId: number;
  taskName: string;
  priority: string;
  assignTo: string;
  startDate: string;
  eta: string;

}

const ELEMENT_DATA: PeriodicElement[] = [
  {taskId: 8865, taskName: 'Some task name that has lengthy characters', priority:'High', assignTo:'Shirley Lopez', startDate:'Jun 23, 2023', eta: 'Jun 23, 2023'},
  {taskId: 8865, taskName: 'Some task name that has lengthy characters', priority:'Medium', assignTo:'Shirley Lopez', startDate:'Jun 23, 2023', eta: 'Jun 23, 2023'},
  {taskId: 8865, taskName: 'Some task name that has lengthy characters', priority:'Low', assignTo:'Shirley Lopez', startDate:'Jun 23, 2023', eta: 'Jun 23, 2023'},
  {taskId: 8865, taskName: 'Some task name that has lengthy characters', priority:'Medium', assignTo:'Shirley Lopez', startDate:'Jun 23, 2023', eta: 'Jun 23, 2023'},
  {taskId: 8865, taskName: 'Some task name that has lengthy characters', priority:'High', assignTo:'Shirley Lopez', startDate:'Jun 23, 2023', eta: 'Jun 23, 2023'},
  {taskId: 8865, taskName: 'Some task name that has lengthy characters', priority:'Medium', assignTo:'Shirley Lopez', startDate:'Jun 23, 2023', eta: 'Jun 23, 2023'},
  {taskId: 8865, taskName: 'Some task name that has lengthy characters', priority:'Low', assignTo:'Shirley Lopez', startDate:'Jun 23, 2023', eta: 'Jun 23, 2023'},
  {taskId: 8865, taskName: 'Some task name that has lengthy characters', priority:'High', assignTo:'Shirley Lopez', startDate:'Jun 23, 2023', eta: 'Jun 23, 2023'},
  {taskId: 8865, taskName: 'Some task name that has lengthy characters', priority:'Low', assignTo:'Shirley Lopez', startDate:'Jun 23, 2023', eta: 'Jun 23, 2023'},

];