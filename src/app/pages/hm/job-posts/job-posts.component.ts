import {
  AfterViewInit,
  ChangeDetectorRef,
  Component,
  ElementRef,
  OnInit,
  ViewChild,
} from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { ActivatedRoute, Router } from '@angular/router';
import { catchError } from 'rxjs/internal/operators/catchError';
import EndPoints from 'src/app/common/endpoints';
import { ApiCallsService } from 'src/app/services/api-calls.service';
import { Utils } from 'src/app/services/utils';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatDialog } from '@angular/material/dialog';
import { MatSort } from '@angular/material/sort';

@Component({
  selector: 'app-job-posts',
  templateUrl: './job-posts.component.html',
  styleUrls: ['./job-posts.component.scss'],
})
export class JobPostsComponent implements OnInit, AfterViewInit {
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
  @ViewChild(MatSort) sort: MatSort;
  dataSource = new MatTableDataSource<any>();
  endpoints = EndPoints;
  selectedTab = 'Active';
  isLoading = false;
  businessUnits: any[] = [];
  sitesList: any[] = [];
  jobTypes: any[] = [];
  jobCount: any;
  totalJobsCount: any;
  queryParam: QueryParam = {
    status: 'ACTIVE',
    types: [],
    pageNo: 1,
    pageSize: 10,
  };
  pageSize = 10;
  selectedJobTypes: boolean[] = [];
  filter: Filter = {} as Filter;
  apiLoad = false;
  sortBy: string = 'id';
  sortOrder: string = 'desc';
  // searchFilter:string ='';
  @ViewChild('searchFilterInp') searchFilterInp: any;

  @ViewChild(MatPaginator) paginator: MatPaginator;

  constructor(
    private apiCalls: ApiCallsService,
    private router: Router,
    private route: ActivatedRoute,
    private cdr: ChangeDetectorRef,
    private utils: Utils,
    private snackBar: MatSnackBar,
    private dialog: MatDialog
  ) {}

  ngOnInit() {
    this.apiLoad = false;
    // const searchParams = JSON.parse(sessionStorage.getItem('searchFilters')!);
    // if (searchParams)
    //   this.queryParam = JSON.parse(JSON.stringify(searchParams));

    // this.queryParam.status = 'ACTIVE';
    // const filterData = JSON.parse(sessionStorage.getItem('filterData')!);
    // if (filterData) {
    //   this.selected = filterData.selected;
    //   this.selectedJobTypes = filterData.selectedJobTypes;
    //   this.filter = filterData.filter;
    // }
    // this.queryParam.status = 'ACTIVE';
    // this.queryParam.pageNo = 1;
    // this.queryParam.pageSize = 10;

    window.scroll({
      top: 0,
    });
    const userId = this.utils.getUser()!;
    this.getUserByUserId(userId);
    this.getJobTypes();
    this.getJobCount();
    setTimeout(() => {
      this.route.queryParams.subscribe((param) => {
        // if (param?.pageNo) {
        //   this.queryParam.pageNo = param['pageNo'];
        //   this.queryParam.pageSize = param['pageSize'];
        // }
        // if (param?.tab) {
        //   this.selectedTab = param.tab;
        //   setTimeout(() => {
        //     this.getSelectedTab(this.selectedTab, 'fromDetails');
        //   }, 100);
        // } else {
        //   this.getAllJobs();
        // }
        console.log(param);
        this.queryParam.status = param['status'] ? param['status'] : 'ACTIVE';
        this.selectedTab =
          this.queryParam.status.charAt(0).toUpperCase() +
          this.queryParam.status.slice(1).toLowerCase();
        this.queryParam.pageNo = param['pageNo']
          ? parseInt(param['pageNo'])
          : 1;
        this.queryParam.pageSize = param['pageSize']
          ? parseInt(param['pageSize'])
          : 10;
        this.queryParam.searchText = param['searchText']
          ? param['searchText']
          : '';
        this.queryParam.startDate = param['startDate']
          ? this.changeDateToUtc(new Date(param['startDate']))
          : '';
        this.queryParam.endDate = param['endDate']
          ? this.changeDateToUtc(new Date(param['endDate']))
          : '';
        this.queryParam.site = param['site'] ? param['site'] : '';
        this.queryParam.businessUnit = param['businessUnit']
          ? param['businessUnit']
          : '';
        this.filter.startDate = this.queryParam.startDate;
        this.filter.endDate = this.queryParam.endDate;
        this.filter.searchText = this.queryParam.searchText;
        this.filter.site = this.queryParam.site;
        this.filter.businessUnit = this.queryParam.businessUnit;

        this.queryParam.types = param['types'] ? param['types'].split(',') : [];
        if (this.queryParam.types?.length) {
          this.jobTypes.forEach((type, index) => {
            this.selectedJobTypes[index] = false;
          });
          this.jobTypes.forEach((type, index) => {
            if (this.queryParam?.types?.indexOf(type.code) !== -1) {
              this.selectedJobTypes[index] = true;
            }
          });
        }
        // else {
        //   this.jobTypes.forEach((type, index) => {
        //     this.queryParam.types?.push(type.code);
        //     this.selectedJobTypes[index] = true;
        //   });
        // }

        if (this.jobTypes.length === this.queryParam?.types?.length) {
          this.selected = true;
        }
        this.sortBy = param['sortBy'] ? param['sortBy'] : 'id';
        this.sortOrder = param['sortOrder'] ? param['sortOrder'] : 'desc';
        this.sort.active = this.sortBy;
        this.sort.direction = this.sortOrder === 'desc' ? 'desc' : 'asc';
        this.getAllJobs();
      });
    }, 1000);
  }

  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
    this.sort.sortChange.subscribe(() => {
      this.sortBy = this.sort.active;
      this.sortOrder = this.sort.direction;
      this.paginator.pageIndex = 0;
      this.getAllJobs();
    });
  }

  isMat: boolean = true;
  isJobBuyer: boolean = true;

  getUserByUserId(id: string) {
    // const queryParam = {
    //   userId: id
    // }
    // this.apiCalls.get(this.endpoints.GET_USER, queryParam)
    //   .pipe(
    //     catchError(async (err) => {
    //       this.utils.showSnackBarMessage(this.snackBar, 'failed to fetch the user');
    //       throw err;
    //     })
    //   )
    //   .subscribe((response) => {
    this.getBusinessUnits(/*response.companyCode*/);
    this.getSitesList(/*response.companyCode*/);
    // });
  }

  getBusinessUnits(/*code: string*/) {
    // let queryParam = {
    //   companyCode: code
    // }
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

  getSitesList(/*code: string*/) {
    // let queryParam = {
    //   companyCode: code
    // }
    this.apiCalls
      .get(this.endpoints.PLANT_LIST /*, queryParam*/)
      .pipe(
        catchError(async (err) => {
          this.utils.showErrorDialog(this.dialog, err);
        })
      )
      .subscribe((response) => {
        this.sitesList = response;
        this.cdr.detectChanges();
      });
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

  getJobCount() {
    this.isLoading = true;
    this.apiCalls
      .get(this.endpoints.JOB_COUNTS)
      .pipe(
        catchError(async (err) => {
          this.utils.showErrorDialog(this.dialog, err);
        })
      )
      .subscribe((response) => {
        this.jobCount = response;
        // this.totalJobsCount = this.jobCount.activeCount;
        this.isLoading = false;
        this.cdr.detectChanges();
      });
  }

  onPaginatorPageChange(event: any) {
    this.queryParam.pageNo = event.pageIndex + 1;
    this.queryParam.pageSize = event.pageSize;
    this.getAllJobs();
  }

  getAllJobs() {
    this.apiLoad = false;
    // const filterData = {
    //   selected: this.selected,
    //   selectedJobTypes: this.selectedJobTypes,
    //   filter: this.filter,
    // };
    // sessionStorage.setItem('searchFilters', JSON.stringify(this.queryParam));
    // sessionStorage.setItem('filterData', JSON.stringify(filterData));

    const payload = JSON.parse(JSON.stringify(this.queryParam));
    console.log(payload);
    if (payload.types.length == this.jobTypes.length) {
      delete payload.types;
    }
    payload.listType =
      this.selectedTab === 'Active'
        ? 'COMPANY_PUBLISHED'
        : this.selectedTab === 'Draft'
        ? 'COMPANY_DRAFT'
        : 'COMPANY_CLOSED';

    switch (this.sort.active) {
      case 'id':
        payload.sortType =
          this.sort.direction === 'desc' ? 'By_ID_Descending' : 'By_ID';
        break;
      case 'type':
        payload.sortType =
          this.sort.direction === 'desc'
            ? 'By_JobTyp_Descending'
            : 'By_JobType';
        break;
      case 'businessUnit':
        payload.sortType =
          this.sort.direction === 'desc'
            ? 'By_BusinessUnit_Descending'
            : 'By_BusinessUnit';
        break;
      case 'site':
        payload.sortType =
          this.sort.direction === 'desc' ? 'By_Site_Descending' : 'By_Site';
        break;
      case 'position':
        payload.sortType =
          this.sort.direction === 'desc'
            ? 'By_JobPositions_Descending'
            : 'By_JobPositions';
        break;
      case 'startDate':
        payload.sortType =
          this.sort.direction === 'desc'
            ? 'By_StartDate_Descending'
            : 'By_StartDate';
        break;
      case 'endDate':
        payload.sortType =
          this.sort.direction === 'desc'
            ? 'By_EndDate_Descending'
            : 'By_EndDate';
        break;
      default:
        payload.sortType =
          this.sort.direction === 'desc' ? 'By_ID_Descending' : 'By_ID';
        break;
    }
    this.isLoading = true;
    this.apiCalls
      .get(this.endpoints.LIST_JOBS, payload)
      .pipe(
        catchError(async (err) => {
          this.utils.showErrorDialog(this.dialog, err);
          this.isLoading = false;
          this.apiLoad = true;
        })
      )
      .subscribe((response) => {
        this.dataSource = new MatTableDataSource<any>(response.list);
        this.totalJobsCount = response.TotalCount;
        if (this.selectedTab == 'Active')
          this.jobCount.activeCount = response.TotalCount;
        else if (this.selectedTab == 'Draft')
          this.jobCount.draftCount = response.TotalCount;
        else if (this.selectedTab == 'Close')
          this.jobCount.closeCount = response.TotalCount;

        this.dataSource.paginator = this.paginator;
        setTimeout(() => {
          this.paginator.pageIndex = this.queryParam.pageNo - 1;
          this.paginator.length = this.totalJobsCount;
        });

        this.cdr.detectChanges();
        var queryParams = new URLSearchParams();
        for (var i in this.queryParam) {
          if (this.queryParam[i]) {
            queryParams.set(i, this.queryParam[i]);
          }
        }
        queryParams.set('sortBy', this.sort.active);
        queryParams.set('sortOrder', this.sort.direction);

        var newURL = location.href.split('?')[0];
        window.history.pushState(
          'object',
          document.title,
          newURL + '?' + queryParams.toString()
        );

        this.isLoading = false;
        this.apiLoad = true;
      });
  }

  goToDetails(element: any) {
    if (this.selectedTab == 'Active' || this.selectedTab == 'Close')
      this.router.navigate(['/hm/job-posts/details'], {
        queryParams: {
          data: element.id,
          tab: this.selectedTab,
          pageNo: this.queryParam.pageNo,
          pageSize: this.queryParam.pageSize,
          sortBy: this.sort.active,
          sortOrder: this.sort.direction,
        },
      });
    else if (this.selectedTab == 'Draft')
      this.router.navigate(['/hm/job-posts/creat-job-post'], {
        queryParams: {
          data: element.id,
          tab: this.selectedTab,
          pageNo: this.queryParam.pageNo,
          pageSize: this.queryParam.pageSize,
          sortBy: this.sort.active,
          sortOrder: this.sort.direction,
        },
      });
  }

  getSelectedTab(tab: string, from?: string) {
    // if (!from) {
    //   this.queryParam.pageNo = 1;
    //   this.queryParam.pageSize = 10;
    //   this.paginator.pageSize = 10;
    // } else {
    //   this.paginator.pageSize = this.queryParam.pageSize;
    // }
    // if (tab == 'Active') this.totalJobsCount = this.jobCount?.activeCount;
    // else if (tab == 'Draft') this.totalJobsCount = this.jobCount?.draftCount;
    // else if (tab == 'Close') this.totalJobsCount = this.jobCount?.closeCount;

    // if (!from) this.resetFilter('tab');
    // this.selectedTab = tab;
    // this.queryParam.status = this.selectedTab.toUpperCase();
    // this.getAllJobs();
    // this.router.navigate([], { queryParams: {} });

    this.queryParam.pageNo = 1;
    this.queryParam.pageSize = 10;
    this.paginator.pageSize = 10;
    this.selectedTab = tab;
    this.queryParam.status = this.selectedTab.toUpperCase();
    this.sort.active = 'id';
    this.sort.direction = 'desc';
    this.getAllJobs();
  }

  searchFilter(event: any) {
    if (event.target.value && event.target.value.length > 2) {
      this.queryParam.searchText = event.target.value;
      this.reloadTable();
    } else {
      this.clearSearch();
    }
  }

  reloadTable() {
    this.queryParam.pageNo = 1;
    this.queryParam.pageSize = 10;
    this.paginator.pageSize = 10;
    this.sort.active = 'id';
    this.sort.direction = 'desc';
    this.getAllJobs();
  }
  filterSite(event: any) {
    this.queryParam.site = event.value;
    this.reloadTable();
  }

  filterBusinessUnit(event: any) {
    this.queryParam.businessUnit = event.value;
    this.reloadTable();
  }

  selected = false;
  filterJobType(event: any, index: any) {
    // if (event.checked) {
    //   if (event.source.value == 'All') {
    //     this.selected = true;
    //     this.queryParam.types = []; //if we click select all with any other already selected
    //     this.jobTypes.forEach((type, index) => {
    //       this.queryParam.types?.push(type.code);
    //       this.selectedJobTypes[index] = true;
    //     });
    //   } else {
    //     this.queryParam.types?.push(event.source.value);
    //     this.selectedJobTypes[index] = true;

    //     this.selected = this.queryParam.types?.length == this.jobTypes.length;
    //   }
    // } else {
    //   if (event.source.value == 'All') {
    //     this.selected = false;
    //     this.queryParam.types = [];
    //     this.jobTypes.forEach((type, index) => {
    //       this.selectedJobTypes[index] = false;
    //     });
    //   } else {
    //     this.selected = false;
    //     console.log(event.source.value);
    //     this.queryParam.types = this.queryParam?.types?.filter(
    //       (val) => val != event.source.value
    //     );
    //     this.selectedJobTypes[index] = false;
    //   }
    // }
    // this.selected = this.queryParam.types?.length == this.jobTypes.length;
    // console.log(this.queryParam);
    if (index == -1) {
      this.jobTypes.forEach((type, index) => {
        this.selectedJobTypes[index] = event.checked;
        if (event.checked) {
          this.queryParam.types?.push(type.code);
        } else {
          this.queryParam.types = this.queryParam.types?.filter(function (
            item: any
          ) {
            return item !== type.code;
          });
        }
      });
    } else {
      this.selectedJobTypes[index] = event.checked;
      if (event.checked) {
        this.queryParam.types?.push(this.jobTypes[index].code);
      } else {
        this.queryParam.types = this.queryParam.types?.filter((item: any) => {
          return item !== this.jobTypes[index].code;
        });
      }
      this.selected = false;
      if (this.queryParam.types?.length === this.jobTypes.length) {
        this.selected = true;
      }
    }
    this.cdr.detectChanges();
    this.reloadTable();
  }

  getDate(event: any, dateType: 'startDate' | 'endDate') {
    let date = this.changeDateToUtc(event);
    this.queryParam[dateType] = date;
    // if (dateType == 'startDate' && !!this.queryParam.endDate && this.queryParam.endDate > date) {
    //   this.queryParam.endDate = this.changeDateToUtc(new Date(date).setDate(new Date(date).))
    // } // TODO: end date  should be automatically increased to next date when start date is  changed.
    this.reloadTable();
  }

  changeDateToUtc(dateObj: any) {
    const date = new Date(dateObj);
    const utcDate = date.toISOString();
    return utcDate;
  }

  resetFilter(tab?: any) {
    delete this.queryParam.site;
    delete this.queryParam.searchText;
    delete this.queryParam.businessUnit;
    delete this.queryParam.startDate;
    delete this.queryParam.endDate;
    this.filter.searchText = '';
    this.queryParam.types = [];
    this.filter.startDate = '';
    this.filter.endDate = '';
    this.filter.site = '';
    this.filter.businessUnit = '';
    this.selectedJobTypes = [];
    this.selected = false;
    this.queryParam.pageNo = 1;
    this.queryParam.pageSize = 10;
    this.sort.active = 'id';
    this.sort.direction = 'desc';
    if (!tab) this.getAllJobs();
  }

  clearSearch() {
    delete this.queryParam.searchText;
    this.reloadTable();
  }

  getJobNameFromType(jobType: string) {
    // console.log('JobTypes = ', this.jobTypes, " && param = ", jobType);
    // return find(this.jobTypes, {id: jobType}).name; // TODO: Convert job name from type.
    return jobType; //TODO: As of now all job types are not provided by jobType API, so above code is breaking. Wait for the fix.
  }

  endDateFilter = (endDate: Date | null) => {
    return (
      this.queryParam?.startDate == null ||
      endDate === null ||
      endDate > new Date(this.queryParam?.startDate)
    );
  };
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
  status: string;
  searchText?: string;
  startDate?: any;
  endDate?: any;
  site?: string;
  businessUnit?: string;
  types?: string[];
  pageNo: number;
  pageSize: number;
};

type JobPostCount = {
  activeCount?: string;
  closeCount?: string;
  draftCount?: string;
};
