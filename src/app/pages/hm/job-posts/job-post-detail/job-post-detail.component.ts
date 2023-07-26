import {AfterViewInit, ChangeDetectorRef, Component, OnInit, ViewChild} from '@angular/core';
import {MatTableDataSource, MatTableModule} from '@angular/material/table';
import {MatPaginator} from '@angular/material/paginator';
import {MatSort} from '@angular/material/sort';
import { Observable, throwError } from 'rxjs';

import {
  DrawerComponent,
  ToggleComponent,

} from '../../../../_metronic/kt/components';
import { ActivatedRoute, Router } from '@angular/router';
import { ApiCallsService } from 'src/app/services/api-calls.service';
import EndPoints from 'src/app/common/endpoints';
import { catchError } from 'rxjs';
import { Utils } from  'src/app/services/utils';

@Component({
  selector: 'app-job-post-detail',
  templateUrl: './job-post-detail.component.html',
  styleUrls: ['./job-post-detail.component.scss']
})
export class JobPostDetailComponent implements OnInit,AfterViewInit {
  jobID: any;
  loading = false;
  endPoints = EndPoints;
  documentsList: any[] = [];
  jobDetails: any;
  selectedTab: string;
  applicationDetails: any;
  applicantsDetails: any;
  costCenterList: any[] = [];
  paymentTermsList: any[] = [];
  applicationAttachement: any[] = [];
  profilePic: any;
  timeSheetFrequencyList: any = {'W': 'Weekly', '2W': 'Bi-Weekly', 'M': 'Monthly'};
  selectedJobSeeker: any = null;
  clickedApplication: string;

  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;

  // displayedColumns: string[] = ['firstName', 'id', 'worker', 'appliedBy','lastUpdate', 'costing', 'action'];
  displayedColumns: string[] = ['title', 'id', 'worker', 'appliedBy', 'modifierDate', 'workRate', 'status'];
  dataSource = new MatTableDataSource<any>;
  
  constructor(private router: Router, private route: ActivatedRoute, private apiCalls: ApiCallsService, 
    private cdr: ChangeDetectorRef, private utils: Utils) {
    // let data = router.getCurrentNavigation()?.extras.state?.data;
    // if(data){
    //   sessionStorage.setItem('jobDetails', JSON.stringify(data));
    // }
    // this.jobID = JSON.parse(sessionStorage.getItem('jobDetails')!);
   }

  ngOnInit(): void {
    // DropdownMenusModule.reinitialization();
    DrawerComponent.reinitialization();
    ToggleComponent.reinitialization();
    this.route.queryParams.subscribe(param => {
      this.jobID = param['data'];
      this.selectedTab = param['tab'];
    });
    this.getCostCenterList();
    this.getPaymentTermsList();
    this.getJobDetails();
  }

  setSelectedJobSeeker(element: any) {
    this.selectedJobSeeker = element;
  }

  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;

  }
  // JobSeekers
  // Details
  isSelectedTab:string ='Details';
  
  getSelectedTab(tab:string): void {
    console.log(tab)
    this.isSelectedTab = tab;
    setTimeout(() => {
      // console.log(   DrawerComponent.getInstance('kt_logs_drawer_toggle'))
      DrawerComponent.hideAll();
      // DrawerComponent.updateAll()
      DrawerComponent.reinitialization();
      // ToggleComponent.reinitialization();
      this.dataSource.paginator = this.paginator;
      this.dataSource.sort = this.sort;
    }, 0);
  }

  getJobDetails(){
    this.loading = true;
    let queryParam = {
      id: this.jobID
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
        console.log(this.jobDetails);
        
        this.cdr.detectChanges();
      })
  }

  getCostCenterList(){
    this.getDropDownValues(this.endPoints.COST_CENTER).subscribe({
      next: (response: any) => {
        this.costCenterList = response;
      },
      error: (error: any) => {
        console.log(error);
      }
    })
  }

  getPaymentTermsList(){
    this.getDropDownValues(this.endPoints.PAY_TERMS).subscribe({
      next: (response: any) => {
        this.paymentTermsList = response;
      },
      error: (error: any) => {
        console.log(error);
      }
    })
  }

  // getTimeSheetFrequencyList() {
  //   this.getDropDownValues(this.endPoints.PAY_TERMS).subscribe({
  //     next: (response: any) => {
  //       this.paymentTermsList = response;
  //     },
  //     error: (error: any) => {
  //       console.log(error);
  //     }
  //   })
  // }

  getDropDownValues(endpoint: any, companyCode?: string): Observable<any> {
    let queryParams;
    if(companyCode){
      queryParams = {'companyCode': companyCode};
    }
    return this.apiCalls.get(endpoint, queryParams)
      .pipe(catchError((err) => {
        return throwError(() => err);
      }));
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
        console.log(error);
        throw error;
      }))
      .subscribe((response) => {
        this.loading = false;
        this.documentsList = response;
        this.cdr.detectChanges();
      })
  }

  getJobSeekersList(id: string){
    this.loading = true;
    let queryParam = {
      jobPostId: id
    }
    this.apiCalls.get(this.endPoints.JOB_SEEKERS_LIST, queryParam)
      .pipe(catchError(async (error) => {
        this.loading = false;
        console.log(error);
        this.cdr.detectChanges();
        throw error;
      }))
      .subscribe((response) => {
        // response = response.filter((list: any) => list.status == 'ACTIVE')
        this.dataSource = new MatTableDataSource<any>(response);
        this.dataSource.paginator = this.paginator;
        this.dataSource.sort = this.sort;
        this.loading = false;
        this.cdr.detectChanges();
      })
  }

  getInterviewedList(id: string){
    this.loading = true;
    let queryParam = {
      jobPostId: id
    }
    this.apiCalls.get(this.endPoints.INTERVIEWED_LIST, queryParam)
      .pipe(catchError(async (error) => {
        this.loading = false;
        console.log(error);
        this.cdr.detectChanges();
        throw error;
      }))
      .subscribe((response) => {
        this.dataSource = new MatTableDataSource<any>(response);
        this.dataSource.paginator = this.paginator;
        this.dataSource.sort = this.sort;
        this.loading = false;
        this.cdr.detectChanges();
      })
  }

  getApplicationDetails(id: string){
    this.loading = true;
    let queryParam = {
      jobApplicationId : id
    }
    this.apiCalls.get(this.endPoints.APPLICATION_DETAILS, queryParam)
      .pipe(catchError(async (error) => {
        this.loading = false;
        this.cdr.detectChanges();
        console.log(error);
        throw error;
      }))
      .subscribe((response) => {
        this.applicationDetails = response;
        this.loading = false;
        this.cdr.detectChanges();
        this.getApplicantsDetails(this.applicationDetails.workerId, id);
      })
  }

  getApplicantsDetails(id: string, applicationId: string){
    this.loading = true;
    let queryParam = {
      workForceId  : id
    }
    this.apiCalls.get(this.endPoints.GET_FULL_APPL_DETAILS, queryParam)
      .pipe(catchError(async (error) => {
        this.loading = false;
        this.cdr.detectChanges();
        throw error;
      }))
      .subscribe((response) => {
        this.loading = false;
        this.applicantsDetails = response;   
        this.getWorkForceProfilePic(applicationId);  
        this.getApplicationAttachment(this.applicantsDetails.workForceId);  
        this.cdr.detectChanges();
      })
  }

  getApplicationAttachment(id: string){
    this.loading = true;
    let queryParam = {
      id: id,
      attachmentType: 'WORK_FORCE',
    };
    this.apiCalls
      .get(this.endPoints.GET_DOCUMENTS, queryParam)
      .pipe(
        catchError(async (error) => {
          this.loading = false;
          this.cdr.detectChanges();
          throw error;
        })
      )
      .subscribe((response) => {
        this.loading = false;
        this.applicationAttachement = response;
        this.cdr.detectChanges();
      });
  }
  
  getWorkForceProfilePic(id: string){
    this.loading = false;
    this.apiCalls.getDocument(this.endPoints.GET_JOB_APPL_PIC, {
      jobApplicationId : id,
      })
      .pipe(
        catchError(async (err) => {
          this.loading = false;
          console.log(id, err);
        })
      )
      .subscribe(async (response: any) => {
        this.profilePic = response.size > 0 ? await this.blobToBase64(response) : undefined;
        this.loading = false;
        this.cdr.detectChanges();
      });
  }

  blobToBase64(blob: any) {
    return new Promise((resolve, _) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result);
      reader.readAsDataURL(blob);
    });
  }

  getAttachment(id: string){
    let queryParam = {
      documentId: id,
    };
    this.apiCalls
      .getDocument(this.endPoints.GET_ATTACHMENT, queryParam)
      .pipe(
        catchError(async (error) => {
          this.cdr.detectChanges();
          throw error;
        })
      )
      .subscribe((response) => {
        const url = window.URL.createObjectURL(response);
        window.open(url);
        this.cdr.detectChanges();
      });
  }

  takeAction(seekerId: string, action: string) {
    this.loading = true;
    let queryParam = {
      jobApplicationId : seekerId,
      newStatus: action
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
      this.getJobSeekersList(this.jobID);
    });
  }

  getInterviewStatus(statusCode: string) {
    let statusString: string;
    switch(statusCode) {
      case 'REJECTED':
        statusString = 'Rejected';
        break;

      case 'HOLD':
        statusString = 'Keep Hold';
        break;

      case 'OFFER_SENT':
        statusString = 'Offer Letter Sent';
        break;

      case 'OFFER_ACCEPTED':
        statusString = 'Offer Letter Accepted';
        break;

      default:
        statusString = 'Active';
    }
    return statusString;
  }

  getInterviewStatusClass(statusCode: string) {
    let statusClass: string;
    switch(statusCode) {
      case 'REJECTED':
        statusClass = 'badge-light-danger';
        break;

      case 'HOLD':
        statusClass = 'badge-light-warning';
        break;

      case 'OFFER_SENT':
        statusClass = 'badge-light-primary';
        break;

      case 'OFFER_ACCEPTED':
        statusClass = 'badge-light-success';
        break;

      default:
        statusClass = 'badge-light-secondary';
    }
    return statusClass;
  }

  setApplicationId(id: string){
    this.clickedApplication = id;
  }

  getDocIcon(fileName: string) {
    return this.utils.getDocIcon(fileName)
  }  
}