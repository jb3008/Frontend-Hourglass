import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import {MatTableDataSource, MatTableModule} from '@angular/material/table';
import { ActivatedRoute, Router } from '@angular/router';
import { catchError } from 'rxjs/internal/operators/catchError';
import { DrawerComponent } from 'src/app/_metronic/kt/components';
import EndPoints from 'src/app/common/endpoints';
import { ApiCallsService } from 'src/app/services/api-calls.service';
import { Utils } from  'src/app/services/utils';

@Component({
  selector: 'app-job-post-detail',
  templateUrl: './job-post-detail.component.html',
  styleUrls: ['./job-post-detail.component.scss']
})
export class JobPostDetailComponent implements OnInit {

  // TODO: Job post detail -> downloading file should not leave page, irrespective of file type supported by browser or not. 
  jobId: string;
  parentTab: string;
  loading = false;
  endPoints = EndPoints;
  jobDetails: any;
  documentsList: any[] = [];
  applicationDetails: any;
  applicationCompleteDetails: any;
  offerDetails: any[] = [];
  actionTaken = false;
  timeSheetFrequencyList: any = {'W': 'Weekly', '2W': 'Bi-Weekly', 'M': 'Monthly'};
  
  isSelectedTab:string ='Details';

  constructor(private route: ActivatedRoute, private apiCalls: ApiCallsService, private router: Router, 
    private cdr: ChangeDetectorRef, private utils: Utils) { }

  ngOnInit(): void {
    this.route.queryParams.subscribe(param => {
      this.jobId = param['jobId'];
      this.parentTab = param['tab'];
      this.isSelectedTab = this.parentTab == 'AppliedJob' ? 'Application' : 'Details';
    });
    if(this.isSelectedTab == 'Application'){
      this.getApplicationDetails();
    }
    this.getJobDetails();  
  }

  // Application
  // Details

  getSelectedTab(tab:string): void {
    console.log(tab)
    this.isSelectedTab = tab

    setTimeout(() => {
      DrawerComponent.hideAll();
      DrawerComponent.reinitialization();

    }, 0); 
    
  }

  getApplicationDetails(){
    this.loading = true;
    let queryParam = {
      jpbPostId : this.jobId,
      vendorId : this.utils.getVendorId()
    }
    this.apiCalls.get(this.endPoints.GET_APPL_DETAILS, queryParam)
      .pipe(catchError(async (error) => {
        this.loading = false;
        this.cdr.detectChanges();
        throw error;
      }))
      .subscribe((response) => {
        this.loading = false;
        this.applicationDetails = response;
        this.getApplicationCompleteDetails();
        this.getOfferDetails();
        this.cdr.detectChanges();
      })
  }

  getApplicationCompleteDetails(){
    this.loading = true;
    let queryParam = {
      workerId: this.applicationDetails.workerid
    }
    this.apiCalls.get(this.endPoints.GET_FULL_APPL_DETAILS, queryParam)
      .pipe(catchError(async (error) => {
        this.loading = false;
        this.cdr.detectChanges();
        throw error;
      }))
      .subscribe((response) => {
        this.loading = false;
        this.applicationCompleteDetails = response;        
        this.cdr.detectChanges();
      })
  }

  getWorkExperience(){
    const years = Math.floor(this.applicationCompleteDetails?.experienceInMonths / 12);
    const months = this.applicationCompleteDetails?.experienceInMonths % 12;

    if (years > 0) {
      if (months > 0) {
        return `${years}.${months} Y`;
      } else {
        return `${years} Y`;
      }
    } else {
      return `${months} M`;
    }
  }

  getJobDetails(){
    this.loading = true;
    let queryParam = {
      id: this.jobId
    }
    this.apiCalls.get(this.endPoints.GET_JOB_DETAILS, queryParam)
      .pipe(catchError(async (error) => {
        this.loading = false;
        this.cdr.detectChanges();
        console.log(error);
        throw error;
      }))
      .subscribe((response) => {
        this.loading = false;
        this.jobDetails = response;
        this.cdr.detectChanges();
      })
  }

  getOfferDetails(){
    this.loading = true;
    let queryParam = {
      jobApplicationId: this.applicationDetails.applicationid
    }
    this.apiCalls.get(this.endPoints.GET_OFFER_LETTER_APPL, queryParam)
      .pipe(catchError(async (error) => {
        this.loading = false;
        this.cdr.detectChanges();
        console.log(error);
        throw error;
      }))
      .subscribe((response) => {
        this.loading = false;
        this.offerDetails = response;
        this.cdr.detectChanges();
      })
  }

  getJobDocuments(id: string){
    this.loading = true;
    let queryParam = {
      id: id,
      attachmentType: 'JOB_POST'
    }
    this.apiCalls.get(this.endPoints.GET_DOCUMENTS, queryParam)
      .pipe(catchError(async (error) => {
        this.loading = false;
        this.cdr.detectChanges();
        throw error;
      }))
      .subscribe((response) => {
        this.loading = false;
        this.documentsList = response;
        this.cdr.detectChanges();
      })
  }

  offerLetterAction(status: string){
    let queryParam = {
      jobAppId : this.applicationDetails?.applicationid,
      offerId : this.offerDetails[0].id
    }
    if(status == 'accept'){
      this.acceptOrRejectOfferLetter(queryParam, this.endPoints.ACCEPT_OFFER_LETTER);
    }else if(status == 'reject'){
      this.acceptOrRejectOfferLetter(queryParam, this.endPoints.REJECT_OFFER_LETTER);
    }
  }

  acceptOrRejectOfferLetter(queryParam: any, endpoint: any){
    this.loading = true;
    this.apiCalls.post(endpoint, '', queryParam)
    .pipe(catchError(async (error) => {
      this.loading = false;
      this.cdr.detectChanges();
      throw error;
    }))
    .subscribe((response) => {
      this.loading = false;
      this.actionTaken = true;
      this.cdr.detectChanges();
    })
  }

  downloadDoc(id: string){
    const url = `http://172.105.36.16:8080/hourglass/document/getAttachment?documentId=${id}`
    window.open(url, '_blank');
  }

  applyJob(id: string){
    this.router.navigate(['/job-posts/job-seeker'], { queryParams: { jobId: id, tab: this.parentTab}})
  }

  getHiringManagerName(jobDetails: any) {
    return jobDetails?.managerDetails?.firstName + ' ' + jobDetails?.managerDetails?.lastName;
  }

  getDocIcon(fileName: string) {
    return this.utils.getDocIcon(fileName);
  }
  
  displayedColumns: string[] = ['taskId', 'taskName', 'assignTo', 'eta','timeSpent', 'progression', 'status', 'log'];
  dataSource = new MatTableDataSource<PeriodicElement>(ELEMENT_DATA);

}

export interface PeriodicElement {
  taskId: number;
  taskName: string;
  assignTo: string;
  eta: string;
  timeSpent: string;
  progression: string;
  status: string;

}

const ELEMENT_DATA: PeriodicElement[] = [
  {taskId: 8865, taskName: 'Some task name that has lengthy characters', assignTo:'Shirley Lopez', eta: '5 Days', timeSpent: '38 hrs', progression: '40%', status: 'In-progress'},
  {taskId: 8865, taskName: 'Some task name that has lengthy characters', assignTo:'Shirley Lopez', eta: '5 Days', timeSpent: '38 hrs', progression: '50%', status: 'In-progress'},
  {taskId: 8865, taskName: 'Some task name that has lengthy characters', assignTo:'Shirley Lopez', eta: '5 Days', timeSpent: '38 hrs', progression: '30%', status: 'In-progress'},
  {taskId: 8865, taskName: 'Some task name that has lengthy characters', assignTo:'Shirley Lopez', eta: '5 Days', timeSpent: '38 hrs', progression: '40%', status: 'In-progress'},
  {taskId: 8865, taskName: 'Some task name that has lengthy characters', assignTo:'Shirley Lopez', eta: '5 Days', timeSpent: '38 hrs', progression: '20%', status: 'In-progress'},
  {taskId: 8865, taskName: 'Some task name that has lengthy characters', assignTo:'Shirley Lopez', eta: '5 Days', timeSpent: '38 hrs', progression: '40%', status: 'In-progress'},
  {taskId: 8865, taskName: 'Some task name that has lengthy characters', assignTo:'Shirley Lopez', eta: '5 Days', timeSpent: '38 hrs', progression: '40%', status: 'In-progress'},
  {taskId: 8865, taskName: 'Some task name that has lengthy characters', assignTo:'Shirley Lopez', eta: '5 Days', timeSpent: '38 hrs', progression: '10%', status: 'In-progress'},
  {taskId: 8865, taskName: 'Some task name that has lengthy characters', assignTo:'Shirley Lopez', eta: '5 Days', timeSpent: '38 hrs', progression: '80%', status: 'In-progress'},

];