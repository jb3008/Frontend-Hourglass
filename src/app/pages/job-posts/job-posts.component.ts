import {
  AfterViewInit,
  ChangeDetectorRef,
  Component,
  ElementRef,
  OnInit,
  ViewChild,
} from '@angular/core';
import { MatPaginator, PageEvent } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { ActivatedRoute, Router } from '@angular/router';
import { catchError } from 'rxjs/internal/operators/catchError';
import EndPoints from 'src/app/common/endpoints';
import { ApiCallsService } from 'src/app/services/api-calls.service';
import { Utils } from 'src/app/services/utils';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Subscription } from 'rxjs';
import { MatDialog } from '@angular/material/dialog';
import { MatSelect } from '@angular/material/select';
import { MatOption } from '@angular/material/core';

@Component({
  selector: 'app-job-posts',
  templateUrl: './job-posts.component.html',
  styleUrls: ['./job-posts.component.scss'],
})
export class JobPostsComponent implements OnInit, AfterViewInit {
  constructor(
    private apiCalls: ApiCallsService,
    private router: Router,
    private route: ActivatedRoute,
    private cdr: ChangeDetectorRef,
    private utils: Utils,
    private snackBar: MatSnackBar,
    private dialog: MatDialog
  ) {}
  isLoading: boolean = false;
  apiLoad: boolean = false;
  dataSource = new MatTableDataSource<any>();
  @ViewChild(MatPaginator) paginator: MatPaginator;
  endpoints = EndPoints;
  reqParam: any = {
    status: 'ACTIVE',
    pageNo: 1,
    pageSize: 10,
    searchText: '',
    types: [],
    jobStatus: [],
    jobKind: [],
    site: '',
    businessUnit: '',
  };
  jobCount = {
    activeJobPost: 0,
    appliedJobCount: 0,
    confirmedJobCount: 0,
  };
  totalJobCount: number = 0;
  jobDetails: any[] = [];
  businessUnits: any[] = [];
  sitesList: any[] = [];
  jobTypes: any[] = [];
  selectAllJobTypes: boolean = false;
  selectedJobTypes: boolean[] = [];

  selectedJobStatusAll: boolean = false;
  selectedJobStatus: boolean[] = [];

  selectedJobKindAll: boolean = false;
  selectedJobKind: boolean[] = [];

  displayedColumns: string[] = [
    'id',
    'type',
    'businessUnit',
    'site',
    'startDate',
    'endDate',
    'message',
    'position',
    'seekers',
  ];
  ngOnInit(): void {
    this.LoadMasterData();
    setTimeout(() => {
      this.route.queryParams.subscribe((param) => {
        this.reqParam.status = param['status'];
        this.reqParam.pageNo = param['pageNo'] ? parseInt(param['pageNo']) : 1;
        this.reqParam.pageSize = param['pageSize']
          ? parseInt(param['pageSize'])
          : 10;
        this.reqParam.searchText = param['searchText']
          ? param['searchText']
          : '';
        this.reqParam.site = param['site'] ? param['site'] : '';
        this.reqParam.types = param['types'] ? param['types'].split(',') : [];

        if (this.reqParam.types) {
          this.jobTypes.forEach((type, index) => {
            if (this.reqParam.types.indexOf(type.code) !== -1) {
              this.selectedJobTypes[index] = true;
            }
          });
          this.selectAllJobTypes = false;
          if (this.reqParam.types.length === this.jobTypes.length) {
            this.selectAllJobTypes = true;
          }
        }
        this.reqParam.jobStatus = param['jobStatus']
          ? param['jobStatus'].split(',')
          : [];

        if (this.reqParam.jobStatus) {
          this.jobStatus.forEach((jobStatus: any, index: number) => {
            if (this.reqParam.jobStatus.indexOf(jobStatus) !== -1) {
              this.selectedJobStatus[index] = true;
            }
          });
          this.selectedJobStatusAll = false;
          if (this.reqParam.jobStatus.length === this.jobStatus.length) {
            this.selectedJobStatusAll = true;
          }
        }
        this.reqParam.jobKind = param['jobKind']
          ? param['jobKind'].split(',')
          : [];
        if (this.reqParam.jobKind) {
          this.jobKind.forEach((jobKind: any, index: number) => {
            if (this.reqParam.jobKind.indexOf(jobKind) !== -1) {
              this.selectedJobKind[index] = true;
            }
          });
          this.selectedJobKindAll = false;
          if (this.reqParam.jobKind.length === this.jobKind.length) {
            this.selectedJobKindAll = true;
          }
        }
        this.reqParam.businessUnit = param['businessUnit']
          ? param['businessUnit']
          : '';

        this.getJobCount();
      });
    }, 100);
  }
  ngAfterViewInit(): void {
    this.dataSource.paginator = this.paginator;
  }
  LoadMasterData() {
    this.getBusinessUnits();
    this.getSitesList();
    this.getJobTypes();
  }
  getJobTypes() {
    this.apiCalls
      .get(this.endpoints.JOB_TYPE)
      .pipe(
        catchError(async (err) => {
          this.utils.showErrorDialog(this.dialog, err);
        })
      )
      .subscribe((response) => {
        this.jobTypes = response;
        this.cdr.detectChanges();
      });
  }
  filterJobType(event: any, index: any) {
    if (index == -1) {
      this.jobTypes.forEach((type, index) => {
        this.selectedJobTypes[index] = event.checked;
        if (event.checked) {
          this.reqParam.types.push(type.code);
        } else {
          this.reqParam.types = this.reqParam.types.filter(function (
            item: any
          ) {
            return item !== type.code;
          });
        }
      });
    } else {
      this.selectedJobTypes[index] = event.checked;
      if (event.checked) {
        this.reqParam.types.push(this.jobTypes[index].code);
      } else {
        this.reqParam.types = this.reqParam.types.filter((item: any) => {
          return item !== this.jobTypes[index].code;
        });
      }
      this.selectAllJobTypes = false;
      if (this.reqParam.types.length === this.jobTypes.length) {
        this.selectAllJobTypes = true;
      }
    }
    this.cdr.detectChanges();
    this.searchFilter();
  }

  jobStatus: any = ['OFFER_SENT', 'HOLD', 'REJECTED'];
  filterJobStatus(event: any, index: any) {
    if (index == -1) {
      this.selectedJobStatus[0] = event.checked;
      this.selectedJobStatus[1] = event.checked;
      this.selectedJobStatus[2] = event.checked;
      if (event.checked) {
        this.reqParam.jobStatus = this.jobStatus;
      } else {
        this.reqParam.jobStatus = [];
      }
    } else {
      this.selectedJobStatus[index] = event.checked;
      if (event.checked) {
        this.reqParam.jobStatus.push(this.jobStatus[index]);
      } else {
        this.reqParam.jobStatus = this.reqParam.jobStatus.filter(
          (item: any) => {
            return item !== this.jobStatus[index];
          }
        );
      }
      this.selectedJobStatusAll = false;
      if (this.reqParam.jobStatus.length === this.jobStatus.length) {
        this.selectedJobStatusAll = true;
      }
    }
    this.cdr.detectChanges();
    this.searchFilter();
  }

  jobKind: any = ['Hourly', 'Fixed'];
  filterJobKind(event: any, index: any) {
    if (index == -1) {
      this.selectedJobKind[0] = event.checked;
      this.selectedJobKind[1] = event.checked;

      if (event.checked) {
        this.reqParam.jobKind = this.jobKind;
      } else {
        this.reqParam.jobKind = [];
      }
    } else {
      this.selectedJobKind[index] = event.checked;
      if (event.checked) {
        this.reqParam.jobKind.push(this.jobKind[index]);
      } else {
        this.reqParam.jobKind = this.reqParam.jobKind.filter((item: any) => {
          return item !== this.jobKind[index];
        });
      }
      this.selectedJobKindAll = false;

      if (this.reqParam.jobKind.length === this.jobKind.length) {
        this.selectedJobKindAll = true;
      }
    }
    this.cdr.detectChanges();
    this.searchFilter();
  }
  getBusinessUnits() {
    this.apiCalls
      .get(this.endpoints.BUSINESS_UNIT_BY_KEY /*, queryParam*/)
      .pipe(
        catchError(async (err) => {
          this.utils.showErrorDialog(this.dialog, err);
        })
      )
      .subscribe((response) => {
        this.businessUnits = response;
        this.cdr.detectChanges();
      });
  }
  getSitesList() {
    this.apiCalls
      .get(this.endpoints.PLANT_LIST /*, queryParam*/)
      .pipe(
        catchError(async (err) => {
          this.utils.showErrorDialog(this.dialog, err);
          throw err;
        })
      )
      .subscribe((response) => {
        this.sitesList = response;
        this.cdr.detectChanges();
      });
  }
  getJobCount() {
    this.isLoading = true;
    let queryParam = {
      vendorCode: this.utils.getVendorId(),
    };
    this.apiCalls
      .get(this.endpoints.GET_JOBAPPL_COUNTS, queryParam)
      .pipe(
        catchError(async (err) => {
          this.utils.showErrorDialog(this.dialog, err);
          this.isLoading = false;
          this.cdr.detectChanges();
          throw err;
        })
      )
      .subscribe((response) => {
        this.jobCount = response;
        this.getAllJobs();
        this.cdr.detectChanges();
      });
  }
  changeStatus() {
    this.reqParam.pageNo = 1;
    this.reqParam.pageSize = 10;
    this.getAllJobs();
  }

  reloadTable() {
    this.reqParam = {
      status: this.reqParam.status,
      pageNo: 1,
      pageSize: 10,
      searchText: '',
      types: [],
      jobStatus: [],
      jobKind: [],
      site: '',
      businessUnit: '',
    };
    this.selectAllJobTypes = false;
    this.selectedJobTypes = [];
    this.selectedJobStatusAll = false;
    this.selectedJobStatus = [];
    this.selectedJobKindAll = false;
    this.selectedJobKind = [];

    this.getAllJobs();
  }
  getAllJobs() {
    this.apiLoad = false;
    let param = JSON.parse(JSON.stringify(this.reqParam));
    if (param.status !== 'ACTIVE') {
      param.vendorId = this.utils.getVendorId();
    }
    if (param.status === 'APPLIED') {
      delete param.status;
    }
    var payload = JSON.parse(JSON.stringify(param));
    if (payload.jobKind && payload.jobKind.length == this.jobKind.length) {
      delete payload.jobKind;
    }
    if (payload.types && payload.types.length == this.jobTypes.length) {
      delete payload.types;
    }

    if (
      payload.jobStatus &&
      payload.jobStatus.length == this.jobStatus.length
    ) {
      delete payload.jobStatus;
    }
    payload.listType =
      this.reqParam.status === 'ACTIVE'
        ? 'VENDOR_PUBLISHED'
        : this.reqParam.status === 'APPLIED'
        ? 'VENDOR_APPLIED'
        : 'VENDOR_CONFIRMED';

    this.apiCalls
      .get(this.endpoints.LIST_JOBS, payload)
      .pipe(
        catchError(async (err) => {
          this.utils.showErrorDialog(this.dialog, err);
          this.isLoading = false;
          this.apiLoad = true;
          throw err;
        })
      )
      .subscribe((response) => {
        this.jobDetails = response.list;
        this.totalJobCount = response.TotalCount;
        setTimeout(() => {
          if (response.list.length) {
            this.paginator.pageIndex = this.reqParam.pageNo - 1;
            this.paginator.length = response.TotalCount;
          }
        }, 100);
        if (this.reqParam.status === 'ACTIVE') {
          this.jobCount.activeJobPost = response.TotalCount;
        } else if (this.reqParam.status === 'APPLIED') {
          this.jobCount.appliedJobCount = response.TotalCount;
        } else if (this.reqParam.status === 'CONFIRMED') {
          this.jobCount.confirmedJobCount = response.TotalCount;
        }
        this.isLoading = false;
        this.apiLoad = true;

        if (
          (this.reqParam.status == 'APPLIED' ||
            this.reqParam.status == 'CONFIRMED') &&
          this.jobDetails?.length > 0
        ) {
          for (let index = 0; index < this.jobDetails.length; index++) {
            const element = this.jobDetails[index];
            this.getProfilePics(element.jobApplicationId, element);
          }
        }
        this.cdr.detectChanges();
        var queryParams = new URLSearchParams();
        for (var i in this.reqParam) {
          if (this.reqParam[i]) {
            queryParams.set(i, this.reqParam[i]);
          }
        }
        var newURL = location.href.split('?')[0];
        window.history.pushState(
          'object',
          document.title,
          newURL + '?' + queryParams.toString()
        );
      });
  }
  getProfilePics(id: any, element: any) {
    this.apiCalls
      .getDocument(this.endpoints.GET_JOB_APPL_PIC, {
        jobApplicationId: id,
      })
      .pipe(
        catchError(async (err) => {
          this.utils.showErrorDialog(this.dialog, err);
          this.isLoading = false;
        })
      )
      .subscribe(async (response: any) => {
        element.profile =
          response.size > 0 ? await this.blobToBase64(response) : undefined;
        this.isLoading = false;
        this.cdr.detectChanges();
      });
  }
  blobToBase64(blob: any) {
    return new Promise((resolve, _) => {
      const reader: any = new FileReader();
      reader.onloadend = () => {
        const base64String = reader?.result?.split(',')[1];
        const base64WithHeader = `data:image/jpeg;base64,${base64String}`;
        resolve(base64WithHeader);
      };
      reader.readAsDataURL(blob);
    });
  }
  onPageChange(event: PageEvent) {
    this.reqParam.pageNo = event.pageIndex + 1;
    this.reqParam.pageSize = event.pageSize;
    this.getAllJobs();
  }
  goToDetails(elementId: any) {
    this.router.navigate(['/job-posts/details'], {
      queryParams: {
        jobId: elementId,
        tab:
          this.reqParam.status == 'APPLIED'
            ? 'AppliedJob'
            : this.reqParam.status == 'CONFIRMED'
            ? 'ConfirmedJob'
            : 'newJob',
      },
    });
  }

  searchFilter() {
    this.reqParam.pageNo = 1;
    this.reqParam.pageSize = 10;
    this.getAllJobs();
  }

  // displayedColumns: string[] = [
  //   'id',
  //   'type',
  //   'businessUnit',
  //   'site',
  //   'startDate',
  //   'endDate',
  //   'message',
  //   'position',
  //   'seekers',
  // ];
  // dataSource = new MatTableDataSource<any>();
  // endpoints = EndPoints;
  // status = 'AC';
  // isLoading = false;
  // apiLoad = false;
  // jobDetails: any[] = [];
  // businessUnits: any[] = [];
  // sitesList: any[] = [];
  // jobTypes: any[] = [];
  // jobCount: any;
  // queryParam: QueryParam = {
  //   pageNo: 1,
  //   pageSize: 10,
  //   status: 'ACTIVE',
  //   types: [],
  //   jobKind: [],
  //   searchText: '',
  //   jobStatus: [],
  //   site: '',
  //   businessUnit: '',
  // };
  // selectedJobTypes: boolean[] = [];
  // filter: Filter = {} as Filter;
  // selectedJobKindAll: boolean = false;
  // selectedJobKind: boolean[] = [false, false];
  // selectedJobStatusAll: boolean = false;
  // selectedJobStatus: boolean[] = [false, false, false];
  // pageSize = 10;
  // currentPage = 0;
  // totalJobCount = 0;
  // // searchFilter:string ='';
  // @ViewChild('searchFilterInp') searchFilterInp: any;
  // @ViewChild(MatPaginator) paginator: MatPaginator;
  // constructor(
  //   private apiCalls: ApiCallsService,
  //   private router: Router,
  //   private route: ActivatedRoute,
  //   private cdr: ChangeDetectorRef,
  //   private utils: Utils,
  //   private snackBar: MatSnackBar,
  //   private dialog: MatDialog
  // ) {}
  // ngOnInit() {
  //   this.apiLoad = false;
  //   window.scroll({
  //     top: 0,
  //   });
  //   this.LoadMasterData();
  //   this.route.queryParams.subscribe((param) => {
  //     this.queryParam.status = param['status'];
  //     this.queryParam.pageNo = param['pageNo'] ? parseInt(param['pageNo']) : 1;
  //     this.queryParam.pageSize = param['pageSize']
  //       ? parseInt(param['pageSize'])
  //       : 10;
  //     this.filter.searchText = param['searchText'] ? param['searchText'] : '';
  //     this.queryParam.searchText = this.filter.searchText;
  //     this.getAllJobs();
  //   });
  // }
  // LoadMasterData() {
  //   this.getBusinessUnits();
  //   this.getSitesList();
  //   this.getJobTypes();
  //   this.getJobCount();
  // }
  // ngAfterViewInit() {
  //   this.dataSource.paginator = this.paginator;
  // }
  // onPageChange(event: PageEvent) {
  //   this.currentPage = event.pageIndex;
  //   this.pageSize = event.pageSize;
  //   this.queryParam.pageNo = event.pageIndex + 1;
  //   this.queryParam.pageSize = event.pageSize;
  //   this.getAllJobs();
  // }
  // getAllJobs() {
  //   this.apiLoad = false;
  //   this.isLoading = true;
  //   if (this.queryParam.status !== 'ACTIVE') {
  //     this.queryParam.vendorId = this.utils.getVendorId();
  //   }
  //   this.apiSubscriptions.forEach((sub) => sub.unsubscribe());
  //   this.apiSubscriptions = [];
  //   const objParam = JSON.parse(JSON.stringify(this.queryParam));
  //   for (var i in objParam) {
  //     if (!objParam[i]) {
  //       delete objParam[i];
  //     }
  //   }
  //   this.apiSubscriptions.push(
  //     this.apiCalls
  //       .get(this.endpoints.LIST_JOBS, objParam)
  //       .pipe(
  //         catchError(async (err) => {
  //           this.utils.showErrorDialog(this.dialog, err);
  //           this.isLoading = false;
  //           this.apiLoad = true;
  //           throw err;
  //         })
  //       )
  //       .subscribe((response) => {
  //         this.jobDetails = response.list;
  //         this.totalJobCount = response.TotalCount;
  //         setTimeout(() => {
  //           this.paginator.pageIndex = this.queryParam.pageNo - 1;
  //           this.paginator.length = response.TotalCount;
  //         }, 100);
  //         this.isLoading = false;
  //         this.apiLoad = true;
  //         const queryParamObj: any = {
  //           pageNo: this.queryParam.pageNo,
  //           pageSize: this.queryParam.pageSize.toString(),
  //           status: this.queryParam.status,
  //           searchText: this.queryParam.searchText,
  //           types: this.queryParam.types,
  //           jobKind: this.queryParam.jobKind,
  //           site: this.queryParam.site,
  //           businessUnit: this.queryParam.businessUnit,
  //         };
  //         if (this.queryParam.status === 'ACTIVE') {
  //           this.jobCount.activeJobPost = response.TotalCount;
  //         } else if (
  //           this.queryParam.status === undefined ||
  //           this.queryParam.status == ''
  //         ) {
  //           this.jobCount.appliedJobCount = response.TotalCount;
  //         } else if (this.queryParam.status === 'CONFIRMED') {
  //           this.jobCount.confirmedJobCount = response.TotalCount;
  //         }
  //         var queryParams = new URLSearchParams();
  //         for (var i in queryParamObj) {
  //           if (queryParamObj[i]) {
  //             queryParams.set(i, queryParamObj[i]);
  //           }
  //         }
  //         var newURL = location.href.split('?')[0];
  //         window.history.pushState(
  //           'object',
  //           document.title,
  //           newURL + '?' + queryParams.toString()
  //         );
  //         this.cdr.detectChanges();
  //         if (
  //           (this.queryParam.status == '' ||
  //             this.queryParam.status == 'CONFIRMED') &&
  //           this.jobDetails?.length > 0
  //         ) {
  //           for (let index = 0; index < this.jobDetails.length; index++) {
  //             const element = this.jobDetails[index];
  //             this.getProfilePics(element.jobApplicationId, element);
  //           }
  //         }
  //       })
  //   );
  // }
  // private apiSubscriptions: Subscription[] = [];
  // getProfilePics(id: any, element: any) {
  //   this.apiSubscriptions.push(
  //     this.apiCalls
  //       .getDocument(this.endpoints.GET_JOB_APPL_PIC, {
  //         jobApplicationId: id,
  //       })
  //       .pipe(
  //         catchError(async (err) => {
  //           this.utils.showErrorDialog(this.dialog, err);
  //           this.isLoading = false;
  //         })
  //       )
  //       .subscribe(async (response: any) => {
  //         element.profile =
  //           response.size > 0 ? await this.blobToBase64(response) : undefined;
  //         this.isLoading = false;
  //         this.cdr.detectChanges();
  //       })
  //   );
  // }
  // blobToBase64(blob: any) {
  //   return new Promise((resolve, _) => {
  //     const reader: any = new FileReader();
  //     reader.onloadend = () => {
  //       const base64String = reader?.result?.split(',')[1];
  //       const base64WithHeader = `data:image/jpeg;base64,${base64String}`;
  //       resolve(base64WithHeader);
  //     };
  //     reader.readAsDataURL(blob);
  //   });
  // }
  // getBusinessUnits() {
  //   this.apiCalls
  //     .get(this.endpoints.BUSINESS_UNIT_BY_KEY /*, queryParam*/)
  //     .pipe(
  //       catchError(async (err) => {
  //         this.utils.showErrorDialog(this.dialog, err);
  //       })
  //     )
  //     .subscribe((response) => {
  //       this.businessUnits = response;
  //       this.cdr.detectChanges();
  //     });
  // }
  // getSitesList() {
  //   this.apiCalls
  //     .get(this.endpoints.PLANT_LIST /*, queryParam*/)
  //     .pipe(
  //       catchError(async (err) => {
  //         this.utils.showErrorDialog(this.dialog, err);
  //         throw err;
  //       })
  //     )
  //     .subscribe((response) => {
  //       this.sitesList = response;
  //       this.cdr.detectChanges();
  //     });
  // }
  // getJobTypes() {
  //   this.apiCalls
  //     .get(this.endpoints.JOB_TYPE)
  //     .pipe(
  //       catchError(async (err) => {
  //         this.utils.showErrorDialog(this.dialog, err);
  //       })
  //     )
  //     .subscribe((response) => {
  //       this.jobTypes = response;
  //       this.cdr.detectChanges();
  //     });
  // }
  // getJobCount() {
  //   this.isLoading = true;
  //   let queryParam = {
  //     vendorCode: sessionStorage.getItem('vendorId'),
  //   };
  //   this.apiCalls
  //     .get(this.endpoints.GET_JOBAPPL_COUNTS, queryParam)
  //     .pipe(
  //       catchError(async (err) => {
  //         this.utils.showErrorDialog(this.dialog, err);
  //         this.isLoading = false;
  //         this.cdr.detectChanges();
  //         throw err;
  //       })
  //     )
  //     .subscribe((response) => {
  //       this.jobCount = response;
  //       this.isLoading = false;
  //       this.cdr.detectChanges();
  //     });
  // }
  // goToDetails(elementId: any) {
  //   this.router.navigate(['/job-posts/details'], {
  //     queryParams: {
  //       jobId: elementId,
  //     },
  //   });
  // }
  // reloadTable() {
  //   this.queryParam.pageNo = 1;
  //   this.queryParam.pageSize = 10;
  //   this.getAllJobs();
  //   return true;
  // }
  // searchFilter(event: any) {
  //   if (event.target.value && event.target.value.length > 2) {
  //     this.queryParam.searchText = event.target.value;
  //     this.queryParam.pageNo = 1;
  //     this.queryParam.pageSize = 10;
  //     this.getAllJobs();
  //   } else {
  //     this.clearSearch();
  //   }
  // }
  // filterSite(event: any) {
  //   this.queryParam.site = event.value;
  //   this.getAllJobs();
  // }
  // filterBusinessUnit(event: any) {
  //   this.queryParam.businessUnit = event.value;
  //   this.getAllJobs();
  // }
  // selected = false;
  // filterJobType(event: any, index: any) {
  //   if (event.checked) {
  //     if (event.source.value == 'All') {
  //       this.selected = true;
  //       this.queryParam.types = []; //if we click select all with any other already selected
  //       this.jobTypes.forEach((type, index) => {
  //         this.queryParam.types?.push(type.code);
  //         this.selectedJobTypes[index] = true;
  //       });
  //     } else {
  //       this.queryParam.types?.push(event.source.value);
  //       this.selectedJobTypes[index] = true;
  //       // this.selected = this.queryParam.types?.length == this.jobTypes.length;
  //       this.selected = this.queryParam.types?.length == this.jobTypes.length;
  //       // (this.queryParam.types?.length == this.jobTypes.length) ?this.selected = true : this.selected = false;
  //     }
  //   } else {
  //     if (event.source.value == 'All') {
  //       this.selected = false;
  //       this.queryParam.types = [];
  //       this.jobTypes.forEach((type, index) => {
  //         this.selectedJobTypes[index] = false;
  //       });
  //     } else {
  //       this.selected = false;
  //       this.queryParam.types = this.queryParam?.types?.filter(
  //         (jobType) => jobType != event.source.value
  //       );
  //       this.selectedJobTypes[index] = false;
  //     }
  //   }
  //   this.queryParam.pageNo = 1;
  //   this.queryParam.pageSize = 10;
  //   this.getAllJobs();
  // }
  // filterJobKind(event: any, index: any) {
  //   if (event.checked) {
  //     if (event.source.value == 'All') {
  //       this.selectedJobKindAll = true;
  //       this.queryParam.jobKind = []; //if we click select all with any other already selected
  //       this.selectedJobKind = [true, true];
  //     } else {
  //       this.queryParam.jobKind?.push(event.source.value);
  //       this.selectedJobKind[index] = true;
  //       this.selectedJobKindAll = this.queryParam.jobKind?.length == 2;
  //     }
  //   } else {
  //     if (event.source.value == 'All') {
  //       this.selectedJobKindAll = false;
  //       this.queryParam.jobKind = [];
  //       this.selectedJobKind = [false, false];
  //     } else {
  //       this.selectedJobKindAll = false;
  //       this.queryParam.jobKind = this.queryParam?.jobKind?.filter(
  //         (jobKind: string) => jobKind != event.source.value
  //       );
  //       this.selectedJobKind[index] = false;
  //     }
  //   }
  //   this.queryParam.pageNo = 1;
  //   this.queryParam.pageSize = 10;
  //   this.getAllJobs();
  // }
  // filterJobStatus(event: any, index: any) {
  //   if (event.checked) {
  //     if (event.source.value == 'All') {
  //       this.selectedJobStatusAll = true;
  //       this.queryParam.jobStatus = ['OfferSent', 'OnHold', 'Rejected']; //if we click select all with any other already selected
  //       this.selectedJobStatus = [true, true, true];
  //     } else {
  //       this.queryParam.jobStatus?.push(event.source.value);
  //       this.selectedJobStatus[index] = true;
  //       this.selectedJobStatusAll = this.queryParam.jobStatus?.length == 3;
  //     }
  //   } else {
  //     if (event.source.value == 'All') {
  //       this.selectedJobStatusAll = false;
  //       this.queryParam.jobStatus = [];
  //       this.selectedJobStatus = [false, false, false];
  //     } else {
  //       this.selectedJobStatusAll = false;
  //       this.queryParam.jobStatus = this.queryParam?.jobStatus?.filter(
  //         (jobStatus: string) => jobStatus != event.source.value
  //       );
  //       this.selectedJobStatus[index] = false;
  //     }
  //   }
  //   this.queryParam.pageNo = 1;
  //   this.queryParam.pageSize = 10;
  //   console.log(this.queryParam);
  //   this.getAllJobs();
  // }
  // resetFilter(from?: any) {
  //   delete this.queryParam.site;
  //   delete this.queryParam.businessUnit;
  //   delete this.queryParam.searchText;
  //   this.queryParam.types = [];
  //   this.queryParam.jobKind = [];
  //   this.queryParam.jobStatus = [];
  //   this.filter.searchText = '';
  //   this.filter.site = '';
  //   this.filter.businessUnit = '';
  //   this.selectedJobTypes = [];
  //   this.selected = false;
  //   this.selectedJobKindAll = false;
  //   this.selectedJobKind = [false, false];
  //   this.selectedJobStatusAll = false;
  //   this.selectedJobStatus = [false, false, false];
  //   this.queryParam.pageNo = 1;
  //   this.queryParam.pageSize = 10;
  //   if (!from) this.getAllJobs();
  // }
  // clearSearch() {
  //   delete this.queryParam.searchText;
  //   this.queryParam.pageNo = 1;
  //   this.queryParam.pageSize = 10;
  //   this.getAllJobs();
  // }
}

type Filter = {
  startDate?: string;
  endDate?: string;
  businessUnit?: string;
  site?: string;
  searchText?: string;
};

type QueryParam = {
  [propName: string]: any;
  status?: string;
  searchText?: string;
  startDate?: string;
  endDate?: string;
  site?: string;
  businessUnit?: string;
  types?: string[];
  jobKind?: string[];
  pageNo: number;
  pageSize: number;
};

type JobPostCount = {
  activeCount?: string;
  closeCount?: string;
  draftCount?: string;
};
