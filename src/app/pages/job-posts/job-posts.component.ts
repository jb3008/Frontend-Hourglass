import {AfterViewInit, ChangeDetectorRef, Component, ElementRef, OnInit, ViewChild} from '@angular/core';
import {MatPaginator} from '@angular/material/paginator';
import {MatTableDataSource} from '@angular/material/table';
import { ActivatedRoute, Router } from '@angular/router';
import { catchError } from 'rxjs/internal/operators/catchError';
import EndPoints from 'src/app/common/endpoints';
import { ApiCallsService } from 'src/app/services/api-calls.service';
import { Utils } from 'src/app/services/utils';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-job-posts',
  templateUrl: './job-posts.component.html',
  styleUrls: ['./job-posts.component.scss']
})

export class JobPostsComponent implements OnInit, AfterViewInit {

  displayedColumns: string[] = ['id', 'type', 'businessUnit', 'site','startDate', 'endDate',  'message','position', 'seekers'];
  dataSource = new MatTableDataSource<any>;
  endpoints = EndPoints;
  selectedTab = 'NewJob';
  isLoading = false;
  jobDetails: any[] = [];
  businessUnits: any[] = [];
  sitesList: any[] = [];
  jobTypes: any[] = [];
  jobCount: any;
  
  queryParam: QueryParam = {
    status: 'ACTIVE',
    types: [],
    jobKind: []
  };

  selectedJobTypes :boolean[] = [];
  filter: Filter = {} as Filter;
  selectedJobKindAll: boolean = false;
  selectedJobKind: boolean[] = [false, false];
  selectedJobStatusAll: boolean = false;
  selectedJobStatus: boolean[] = [false, false, false];

  // searchFilter:string ='';
  @ViewChild("searchFilterInp") searchFilterInp: HTMLInputElement;

  @ViewChild(MatPaginator) paginator: MatPaginator;

  constructor( private apiCalls: ApiCallsService, private router: Router, private route: ActivatedRoute, 
    private cdr: ChangeDetectorRef, private utils: Utils, private snackBar: MatSnackBar){}

  ngOnInit(){
    window.scroll({
      top: 0
    });
    const userId = this.utils.getUser()!;
    this.getUserByUserId(userId);
    this.getJobTypes();
    this.getJobCount();
    this.route.queryParams.subscribe(param => {
      if(param?.tab){
        this.selectedTab = param.tab;
        setTimeout(() => {
          this.getSelectedTab(this.selectedTab);
        }, 100);
      } else {
        this.getAllJobs();
      }
    });
  }

  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
  }

  getAllJobs() {
    this.isLoading = true;
    this.apiCalls.get(this.endpoints.LIST_JOBS, this.queryParam)
      .pipe(
        catchError(async (err) => {
          this.utils.showSnackBarMessage(this.snackBar, 'failed to fetch the jobs');
          this.isLoading = false;
          throw err;
        })
      )
      .subscribe((response) => {
        this.jobDetails = response;
        this.isLoading = false;
        this.cdr.detectChanges();
      });
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
        this.getBusinessUnits(/*response.companyCode*/);
        this.getSitesList(/*response.companyCode*/);
      });
  }

  getBusinessUnits(/*code: string*/){
    // let queryParam = {
    //   companyCode: code
    // }
    this.apiCalls.get(this.endpoints.BUSINESS_UNIT/*, queryParam*/)
      .pipe(
        catchError(async (err) => {
          this.utils.showSnackBarMessage(this.snackBar, 'failed to fetch the business units');
          throw err;
        })
      )
      .subscribe((response) => {
        this.businessUnits = response;
        this.cdr.detectChanges();
      });
  }

  getSitesList(/*code: string*/){
    // let queryParam = {
    //   companyCode: code
    // }
    this.apiCalls.get(this.endpoints.PLANT_LIST/*, queryParam*/)
      .pipe(
        catchError(async (err) => {
          this.utils.showSnackBarMessage(this.snackBar, 'failed to fetch the sites list');
          throw err;
        })
      )
      .subscribe((response) => {
        this.sitesList = response;
        this.cdr.detectChanges();
      });
  }

  getJobTypes(){
    this.apiCalls.get(this.endpoints.JOB_TYPE)
    .pipe(
      catchError(async (err) => {
        this.utils.showSnackBarMessage(this.snackBar, 'failed to fetch the job types');
        throw err;
      })
    )
    .subscribe((response) => {
      this.jobTypes = response;
      this.cdr.detectChanges();
    });
  }

  getJobCount(){
    this.isLoading = true;
    let queryParam = {
      vendorCode: sessionStorage.getItem('vendorId')
    }
    this.apiCalls.get(this.endpoints.GET_JOBAPPL_COUNTS, queryParam)
      .pipe(
        catchError(async (err) => {
          this.utils.showSnackBarMessage(this.snackBar, 'failed to get the job counts');
          this.isLoading = false;
          this.cdr.detectChanges();
          throw err;
        })
      )
      .subscribe((response) => {
        this.jobCount = response;
        this.isLoading = false;
        this.cdr.detectChanges();
      });
  }


  goToDetails(elementId: any){
    if(this.selectedTab == 'NewJob' || this.selectedTab == 'AppliedJob')
      this.router.navigate(['/job-posts/details'], {queryParams: {jobId: elementId , tab: this.selectedTab}});
    // else if(this.selectedTab == 'AppliedJob')
    //   this.router.navigate(['/hm/job-posts/creat-job-post'], {queryParams: {data: element.id , tab: this.selectedTab}})
  }

  getSelectedTab(tab:string) {
    // if (this.selectedTab == tab) {
    //   return false;
    // }

    this.selectedTab = tab;
    this.resetFilter('selectedTab');
    // TODO: hack until backend API is ready to provide data based on proper status.
    const vendorId = this.utils.getVendorId();
    switch(tab) {
      case 'AppliedJob':
        this.queryParam.status = 'ACTIVE';
        this.queryParam.vendorId = vendorId;
        break;

      case 'ConfirmedJob':
        this.queryParam.status = 'CONFIRMED';
        this.queryParam.vendorId = vendorId;
        break;

      default:  // NewJob
        this.queryParam.status = 'ACTIVE';
        delete this.queryParam.vendorId;
    }
    // this.queryParam.status = this.selectedTab.toUpperCase();
    // TODO: hack ends.

    this.getAllJobs();
    this.router.navigate([], { queryParams: {} })
    
    return true;
  }

  searchFilter(event: any){
    if(event.target.value && event.target.value.length > 2){
      this.queryParam.searchText = event.target.value;
      this.getAllJobs();
    }else{
      this.clearSearch();
    }
  }

  filterSite(event: any){
    this.queryParam.site = event.value;
    this.getAllJobs();
  }

  filterBusinessUnit(event: any) {
    this.queryParam.businessUnit = event.value;
    this.getAllJobs();
  }

  selected = false;
  filterJobType(event: any, index: any){
    if(event.target.checked){
      if(event.target.value == 'All'){
        this.selected = true;
        this.queryParam.types = []; //if we click select all with any other already selected
        this.jobTypes.forEach((type, index) => {
          this.queryParam.types?.push(type.id);
          this.selectedJobTypes[index] = true;
        })
      }else{
        this.queryParam.types?.push(event.target.value);
        this.selectedJobTypes[index] = true;

        this.selected = this.queryParam.types?.length == this.jobTypes.length;
      }
    }else{
      if(event.target.value == 'All'){
        this.selected = false;
        this.queryParam.types = [];
        this.jobTypes.forEach((type, index) => {
          this.selectedJobTypes[index] = false;
        })
      }else{
        this.selected = false;
        this.queryParam.types = this.queryParam?.types?.filter(jobType => jobType != event.target.value);
        this.selectedJobTypes[index] = false;
      }
    }
    this.getAllJobs();
  }

  filterJobKind(event: any, index: any){
    if(event.target.checked){
      if(event.target.value == 'All'){
        this.selectedJobKindAll = true;
        this.queryParam.jobKind = ['Fixed', 'Hourly']; //if we click select all with any other already selected
        this.selectedJobKind = [true, true];
      }else{
        this.queryParam.jobKind?.push(event.target.value);
        this.selectedJobKind[index] = true;

        this.selectedJobKindAll = this.queryParam.jobKind?.length == 2;
      }
    }else{
      if(event.target.value == 'All'){
        this.selectedJobKindAll = false;
        this.queryParam.jobKind = [];
        this.selectedJobKind = [false, false];
      }else{
        this.selectedJobKindAll = false;
        this.queryParam.jobKind = this.queryParam?.jobKind?.filter((jobKind: string) => jobKind != event.target.value);
        this.selectedJobKind[index] = false;
      }
    }
    this.getAllJobs();
  }

  filterJobStatus(event: any, index: any){
    if(event.target.checked){
      if(event.target.value == 'All'){
        this.selectedJobStatusAll = true;
        this.queryParam.jobStatus = ['OfferSent', 'OnHold', 'Rejected']; //if we click select all with any other already selected
        this.selectedJobStatus = [true, true, true];
      }else{
        this.queryParam.jobStatus?.push(event.target.value);
        this.selectedJobStatus[index] = true;

        this.selectedJobStatusAll = this.queryParam.jobStatus?.length == 3;
      }
    }else{
      if(event.target.value == 'All'){
        this.selectedJobStatusAll = false;
        this.queryParam.jobStatus = [];
        this.selectedJobStatus = [false, false, false];
      }else{
        this.selectedJobStatusAll = false;
        this.queryParam.jobStatus = this.queryParam?.jobStatus?.filter((jobStatus: string) => jobStatus != event.target.value);
        this.selectedJobStatus[index] = false;
      }
    }
    this.getAllJobs();
  }

  resetFilter(from?: any) {
    delete this.queryParam.site;
    delete this.queryParam.businessUnit;
    delete this.queryParam.searchText;
    this.queryParam.types = [];
    this.queryParam.jobKind = [];
    this.queryParam.jobStatus = [];
    this.filter.site = '';
    this.filter.businessUnit = '';
    this.selectedJobTypes = [];
    this.selected = false;
    this.selectedJobKindAll = false;
    this.selectedJobKind = [false, false];
    this.selectedJobStatusAll = false;
    this.selectedJobStatus = [false, false, false];
    if(!from)
      this.getAllJobs();
  }
  
  // selectedTab: string = 'Active';
//  getSelectedTab(tab: string): void {
//    console.log(tab);
//    this.selectedTab = tab;
//  }

  clearSearch() {
    delete this.queryParam.searchText;
    this.getAllJobs();
  }

/*
  goToDetails(id: string){
    this.router.navigate(['/job-posts/details'], { queryParams: { jobId: id}});
  }
*/
  
  getJobNameFromType(jobType: string) {
    // console.log('JobTypes = ', this.jobTypes, " && param = ", jobType);
    // return find(this.jobTypes, {id: jobType}).name; // TODO: Convert job name from type.
    return jobType;  //TODO: As of now all job types are not provided by jobType API, so above code is breaking. Wait for the fix.
  }
}

type Filter = {
  startDate?: string,
  endDate?: string,
  businessUnit?: string,
  site?: string
};

type QueryParam = {
  [propName: string]: any;
  status: string;
  searchText?: string;
  startDate?: string;
  endDate?: string;
  site?: string;
  businessUnit?: string;
  types?: string[];
  jobKind?: string[];
};

type JobPostCount = {
  activeCount?: string;
  closeCount?: string;
  draftCount?: string;
};
