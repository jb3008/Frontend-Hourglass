import { ChangeDetectorRef, Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { FormGroup, FormBuilder, Validators, FormControl } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import InlineEditor from '@ckeditor/ckeditor5-build-inline';
import { Observable, catchError, map, retry, startWith, throwError } from 'rxjs';
import EndPoints from 'src/app/common/endpoints';
import { ApiCallsService } from 'src/app/services/api-calls.service';
import { Utils } from 'src/app/services/utils';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { DialogComponent } from 'src/app/common/dialog/dialog.component';
import { HttpParams } from '@angular/common/http';
import { MatSelect } from '@angular/material/select';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-create-job-post',
  templateUrl: './create-job-post.component.html',
  styleUrls: ['./create-job-post.component.scss']
})
export class CreateJobPostComponent implements OnInit, OnDestroy {

  endPoints  = EndPoints;
  siteList: any[] = [];
  businessUnits: any[] = [];
  costCenterList: any[] = [];
  hiringManager: any[] = [];
  hiringManagerSearchResult: Observable<any[]>;
  jobTypes: any[] = [];
  timesheetFrequency: any[] = [];
  legalEntities: any[] = [];
  payTerms: any[] = [];
  draftDetails: any[] = [];
  currencies: any[] = [];
  jobPostData: FormGroup;
  endDate: Date;
  isLoading = false;
  jobId: string;
  jobKind: string = 'Hourly';
  budgetMin: number = 0;
  budgetMax: number = 0;
  selectedTab: string;
  draftJobDetails: any;
  documentsList: any;
  dialogRef: MatDialogRef<DialogComponent>;
  today = new Date();
  hiringManagerCntrl = new FormControl();

  @ViewChild('siteSelect') siteSelect: MatSelect;

  constructor(private fb: FormBuilder, private apiCalls: ApiCallsService, private utils: Utils, 
    private router: Router, private dialog: MatDialog, private snackBar: MatSnackBar,
      private route: ActivatedRoute, private cdr: ChangeDetectorRef) {}

  ngOnInit(): void {
    this.jobPostData = this.fb.group({
      jobTitle: ['', Validators.required],
      jobDescription: ['', Validators.required],
      hiringManager: ['', Validators.required],
      priority: ['Medium'],
      openPosition: ['', Validators.required],
      jobType: ['', Validators.required],
      jobKind: ['Hourly', Validators.required],
      workRate: [''],
      minBudget: [''],
      maxBudget: [''],
      workRateCurrency: ['', Validators.required],
      reportDate: ['', Validators.required],
      startDate: ['', Validators.required],
      endDateNumber: ['', Validators.required],
      endDate: ['', Validators.required],  //valid till value will go here //not there in ui
      timesheetFreq: ['Weekly (Default)', Validators.required],
      workHourInterval: ['', Validators.required],
      workHours: ['', Validators.required],
      costCenter: ['', Validators.required],
      payTerms: ['30', Validators.required],
      legalEntity: ['', Validators.required],
      site: ['', Validators.required],
      location: [{value: '', disabled: true}, Validators.required],
      businessUnit: ['', Validators.required],
      workPolicyDoc: ['', Validators.required],
      aboutOrgDoc: ['', Validators.required],
      requirementDoc: ['', Validators.required],
      otherDocList: [[]],
    });

    this.route.queryParams.subscribe(param => {
      this.jobId = param['data'];
      this.selectedTab = param['tab'];
    });

    this.getHiringManagers();
    this.getJobType();
    this.getTimeSheetFrequency();
    this.getCostCenter();
    this.getPaymenTerms();
    this.getLegalEntities();
    this.getCurrencies();
    if(this.jobId){
      this.getJobDocuments(this.jobId);
      
    }
  }

  ngOnDestroy(): void {
  }
  
  editor = InlineEditor;
  // data: any = `<p>Hello, world!</p>`;
  data: any = '';
  
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

  selectFile(event: any, name: any){
    const file = event.target.files[0];
    if(file.type.indexOf('image') == 0){
      this.utils.showSnackBarMessage(this.snackBar, 'Please upload documents only');
    } else if (file.size > 2 * 1024 * 1024) { // check if file size is > 2 MB
      this.utils.showSnackBarMessage(this.snackBar, 'Maximum allowed file size is 2 MB. Please choose another file.');
    } else {
      if(name == 'otherDocList'){
        const docList = this.jobPostData.controls[name].value;
        if (docList.length < 6) {
          if (this.utils.isFileExist(docList, file)) {
            this.utils.showSnackBarMessage(this.snackBar, 'This file "' + file.name + '" already exist.');
          } else {
            this.jobPostData.controls[name].value.push(file);
          }
        } else {
          this.utils.showSnackBarMessage(this.snackBar, 'Maximum 6 files can be added.');
        }
      } else {
        this.jobPostData.controls[name].setValue(file);
      }
      console.log(this.jobPostData.value);
    }
  }

  clearFile(name: string) {
    this.jobPostData.controls[name].setValue(null);
  }

  clearFileOther(name: string, index: number) {
    this.jobPostData.controls[name].value.splice(index, 1);
  }
  
  clearFileInput(element: any) {
    this.utils.clearFileInput(element);
  }
  
  setDraftDetailsData(){
    this.getJobDetailsByid();
  }

  getJobDetailsByid(){
    this.isLoading = true;
    let queryParams = {
      id: this.jobId
    }
    this.apiCalls.get(this.endPoints.GET_JOB_DETAILS, queryParams)
      .pipe(catchError(async (err) => {
        console.log(err);
        this.isLoading = false;
        this.cdr.detectChanges();
        throw err;
      }))
      .subscribe(response => {
        this.draftJobDetails = response;
        this.isLoading = false;
        this.cdr.detectChanges();
        this.setDraftDataOnUi();
      })
  }

  setDraftDataOnUi(){
    this.getPlantsList(this.draftJobDetails.companyDetails.companyCode);
    this.getBusinessUnits(this.draftJobDetails.companyDetails.companyCode);
    this.jobKind = this.draftJobDetails.jobKind;
    const oneDay = 24 * 60 * 60 * 1000;
    const startDate: any = new Date(this.draftJobDetails.startDate);
    const endDate: any = new Date(this.draftJobDetails.endDate);
    const differenceInMilliseconds = Math.abs(endDate - startDate);
    const differenceInDays = Math.round(differenceInMilliseconds / oneDay);
    this.hiringManagerCntrl.setValue(this.draftJobDetails.managerDetails);
    setTimeout(() => {
      this.jobPostData.patchValue({
        jobTitle: this.draftJobDetails.title,
        jobDescription: this.draftJobDetails.description,
        hiringManager: this.draftJobDetails.managerDetails?.userId,
        priority: this.draftJobDetails.priority,
        openPosition: this.draftJobDetails.openPosition,
        jobType: this.draftJobDetails.type,
        jobKind: this.draftJobDetails.jobKind,
        workRate: this.draftJobDetails?.rate,
        minBudget: this.draftJobDetails?.minBudget,
        maxBudget: this.draftJobDetails?.maxBudget,
        workRateCurrency: this.draftJobDetails.currency,
        reportDate: this.draftJobDetails.reportDate,
        startDate: this.draftJobDetails.startDate,
        endDateNumber: differenceInDays,
        endDate: this.draftJobDetails.endDate,
        timesheetFreq: this.draftJobDetails.timeSheetFreq,
        workHourInterval: this.draftJobDetails.workHourInterval,
        workHours: this.draftJobDetails.workHours,
        costCenter: this.draftJobDetails.costCenter,
        payTerms: this.draftJobDetails.payTerms,
        legalEntity: this.draftJobDetails.companyDetails?.companyCode,
        site: this.draftJobDetails.siteDetails?.code,
        location: this.draftJobDetails.siteDetails?.city,
        businessUnit: this.draftJobDetails.businessUnitDetails?.code
      })
      let site = this.siteList.filter(obj => obj.code == this.draftJobDetails.siteDetails?.code);
      this.siteSelect.value = site[0];
      this.cdr.detectChanges();
    }, 500);
  }

  getPlaceHolder() {
    // TODO: Remove this hard coded code.
    return this.draftDetails ? 'temp job by lokesh' : 'Some Job Post Title'
  }

  displayFn(hiringManager: any): string {
    return hiringManager ? `${hiringManager.firstName} ${hiringManager.lastName}` : '';
  }
  
  showSearchResult(data: any){
    return this.hiringManager.filter(obj => {
      let fullName = `${obj.firstName} ${obj.lastName}`.toLowerCase();
      if(data && typeof data === 'object'){
        data = data.firstName + ' ' + data.lastName;
      }
      let searchData = data.toLowerCase();
      let filteredData = fullName.includes(searchData);
      return filteredData
    })
  }

  setHiringManagerValue(event: any){
    let value = event.option.value.userId;
    this.jobPostData.controls['hiringManager'].setValue(value);
  }

  getHiringManagers(){
    this.getDropDownValues(this.endPoints.HIRING_MANGER).subscribe({
      next: response => {
        this.hiringManager = response;
        this.getFilteredValuesForHm();
      },
      error: error => {
        console.log(error);
      }
    })
  }

  getFilteredValuesForHm(reset?: string){
    if(reset){
      this.jobPostData.controls['hiringManager'].setValue('');
    }
    this.hiringManagerSearchResult = this.hiringManagerCntrl.valueChanges.pipe(
      startWith(''),
      map(value => this.showSearchResult(value))
    )
  }

  getJobType(){
    this.getDropDownValues(this.endPoints.JOB_TYPE).subscribe({
      next: response => {
        this.jobTypes = response
      },
      error: error => {
        console.log(error);
      }
    })
  }

  getTimeSheetFrequency(){
    this.getDropDownValues(this.endPoints.TIMESHEET_FREQ).subscribe({
      next: response => {
        this.timesheetFrequency = response;
      },
      error: error => {
        console.log(error);
      }
    })
  }

  getLegalEntities(){
    this.getDropDownValues(this.endPoints.LEGAL_ENTITY).subscribe({
      next: response => {
        this.legalEntities = response;
      },
      error: error => {
        console.log(error);
      }
    })
  }

  getPlantsList(companyCode: string){
    this.getDropDownValues(this.endPoints.PLANT_LIST, companyCode).subscribe({
      next: response => {
        this.siteList = response;
      },
      error: error => {
        console.log(error);
      }
    })
  }

  getBusinessUnits(companyCode: string){
    this.getDropDownValues(this.endPoints.BUSINESS_UNIT, companyCode).subscribe({
      next: response => {
        this.businessUnits = response;
      },
      error: error => {
        console.log(error);
      }
    })
  }

  getCostCenter(){
    this.getDropDownValues(this.endPoints.COST_CENTER).subscribe({
      next: response => {
        this.costCenterList = response;
      },
      error: error => {
        console.log(error);
      }
    })
  }

  getPaymenTerms(){
    this.getDropDownValues(this.endPoints.PAY_TERMS).subscribe({
      next: response => {
        this.payTerms = response;
      },
      error: error => {
        console.log(error);
      }
    })
  }

  getCurrencies(){
    this.isLoading = true;
    this.apiCalls.get(this.endPoints.GET_CURRENCY)
      .pipe(catchError(async (err) => {
        this.isLoading = false;
        setTimeout(() => {
          throw err;  
        }, 10);
        this.cdr.detectChanges();
      }))
      .subscribe(response => {
        this.isLoading = false;
        this.currencies = response;
        this.cdr.detectChanges();
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
  
  getLegalEntityCode(event: any){
    this.getPlantsList(event.value);
    this.getBusinessUnits(event.value);
    this.jobPostData.controls['site'].setValue(null);
    this.jobPostData.controls['businessUnit'].setValue(null);
    this.jobPostData.controls['location'].setValue(null);
  }

  setLocationValue(event: any){
    this.jobPostData.controls['site'].setValue(event.value.code);
    this.jobPostData.controls['location'].setValue(event.value.city);
  }

  changeInputValue(element: HTMLElement, action: string){
    let formControl = element.getAttribute('formControlName');
    let value;
    if(formControl)
        value = this.jobPostData.get(formControl)?.value
    if(action == '-'){
      if(value == 1 || !value)
        return;
      
      if(formControl)
        this.jobPostData.get(formControl)?.setValue(--value);
    }else if(action == '+'){
      if(formControl)
        this.jobPostData.get(formControl)?.setValue(++value);
    }
    
  }

  changeDateToUtc(dateObj: any){
    const date = new Date(dateObj);
    const utcDate = date.toISOString()
    return utcDate;
  }

  cancelJobPost(){
    this.router.navigate(['/hm/job-posts']);
  }
  
  calculateEndDate(){
    let startDate = this.jobPostData.controls['startDate'].value;
    let exisitingDate = new Date(startDate);
    this.endDate = new Date(exisitingDate.getTime());
    this.endDate.setDate(this.endDate.getDate() + Number(this.jobPostData.controls['endDateNumber'].value));
    this.jobPostData.patchValue({endDate: this.endDate})
  }

  changeValidTill(event: any){
    if(event.target.value || event.target.value == ''){
      this.jobPostData.controls['endDate'].setValue(null);
    }
  }

  numberOnly(event: any) {
    return this.utils.numberOnly(event);
  }

  numberAndDecimalOnly(event: any){
    return this.utils.numbersAndDecimal(event);
  }

  showConsent() {
    let filesExist: boolean = false;
    for (const key of Object.keys(this.jobPostData.value) ) {
      if(key == 'workPolicyDoc' || key == 'aboutOrgDoc' || key == 'requirementDoc' || key == 'otherDocList') {
        filesExist = true;
        break;
      }
    }

    if (filesExist) {
      const msg = 'Attachements will not be saved with draft. Do you want to continue?';
      this.utils.showDialogWithCancelButton(this.dialog, msg, (result: any) => {
        if (result) {
          this.saveJob('draft');
        }
      });
    } else {
      this.saveJob('draft');
    }
  }

  changeRateValue(){
    if(this.jobKind == 'Fixed'){
      this.jobPostData.controls['workRate'].setValue(null);
    }else{
      this.jobPostData.controls['minBudget'].setValue(null);
      this.jobPostData.controls['maxBudget'].setValue(null);
    }
  }
  
  saveJob(status: string){
    const formData = new FormData();
    let workRateValue = this.jobPostData.controls['workRate'].value;
    let minBudget = this.jobPostData.controls['minBudget'].value;
    let maxBudget = this.jobPostData.controls['maxBudget'].value;
    if(this.jobPostData.valid && (workRateValue || (minBudget && maxBudget))){
      if((workRateValue && workRateValue == 0) || (minBudget && minBudget == 0) || (maxBudget && maxBudget == 0)){
        this.utils.showSnackBarMessage(this.snackBar, 'Please enter an amount greater than 0');
        return;
      }
      this.isLoading = true;
      this.jobPostData.controls['reportDate'].setValue(this.changeDateToUtc(this.jobPostData.controls['reportDate'].value))
      this.jobPostData.controls['startDate'].setValue(this.changeDateToUtc(this.jobPostData.controls['startDate'].value))
      this.jobPostData.controls['endDate'].setValue(this.changeDateToUtc(this.jobPostData.controls['endDate'].value));

      for (const key of Object.keys(this.jobPostData.value) ) {
        if(key !== 'workPolicyDoc' && key != 'aboutOrgDoc' && key !== 'requirementDoc' && key !== 'otherDocList'){
          const value = this.jobPostData.value[key];
          formData.append(key, value);
        }else{
          if(status != 'draft'){
            if(key == 'otherDocList'){
              const file = this.jobPostData.get(key)?.value;
              if(file && file.length != 0){
                file.forEach((fileObj: File) => {
                  const blob = new Blob([fileObj], { type: fileObj.type });
                  formData.append(key, blob, fileObj.name);
                })
              }
            }else{
              const file = this.jobPostData.get(key)?.value;
              const blob = new Blob([file], { type: file.type });
              formData.append(key, blob, file.name);
            }
          }
        }
      }

      if (this.jobKind == 'Fixed') {
        formData.delete('workRate');  
        formData.append('workRate', '0');  
      } else if (this.jobKind == 'Hourly') {
        formData.delete('minBudget');  
        formData.append('minBudget', '0');  
        formData.delete('maxBudget');  
        formData.append('maxBudget', '0');  
      }
      formData.append('jobStatus', status.toUpperCase());

      // if(status == 'draft'){
      formData.append('id', this.jobId || '0')
      // } else {
        // formData.append('id', '0');
      // }

      this.apiCalls.post(status == 'draft' ? this.endPoints.DRAFT_JOB : this.endPoints.CREATE_JOB, formData)
      .pipe(catchError(async (err) => {
        this.isLoading = false;
        setTimeout(() => {
          throw err;  
        }, 10);
        this.cdr.detectChanges();
      }))
      .subscribe(response => {
        if (this.isLoading) { // isLoading = true indicates no error.
          this.openSuccessPopup(status, status == 'draft' ? this.jobId : response);
        }
      })
    }
      else{
        this.utils.showSnackBarMessage(this.snackBar, 'Please enter all required data');
    }
  }

  openSuccessPopup(status: string, id: string){
    let msg;
    if(status == 'active'){
      msg = 'Your Job is posted successfully. Job Id = ' + id;
    } else if(status == 'draft'){
      msg = 'Your Job is drafted successfully'
    }
    this.utils.showDialog(this.dialog, msg, () => {
      this.isLoading = false;
      this.router.navigate(['/hm/job-posts'], { queryParams: { tab: (status == 'draft' ? 'Draft' : 'Active')}});
    });
  }

  getDisplayText(name: string, code: string) {
    return name + ' (' + code + ')'; 
  }

  getJobDocuments(id: string){
    this.isLoading = true;
    let queryParam = {
      id : id,
      attachmentType: 'JOB_POST'
    }
    this.apiCalls.get(this.endPoints.GET_DOCUMENTS, queryParam)
      .pipe(catchError(async (error) => {
        this.isLoading = false;
        this.cdr.detectChanges();
        console.log(error);
        throw error;
      }))
      .subscribe((response) => {
        this.isLoading = false;
        this.documentsList = response;
        this.cdr.detectChanges();
        this.setDraftDetailsData();
      })
  }
}
