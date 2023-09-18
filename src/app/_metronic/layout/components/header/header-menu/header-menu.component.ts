import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';
import { LayoutType } from '../../../core/configs/config';
import { LayoutInitService } from '../../../core/layout-init.service';
import { LayoutService } from '../../../core/layout.service';
import { Utils } from 'src/app/services/utils';
import { ApiCallsService } from 'src/app/services/api-calls.service';
import EndPoints from 'src/app/common/endpoints';
import { catchError } from 'rxjs/internal/operators/catchError';

@Component({
  selector: 'app-header-menu',
  templateUrl: './header-menu.component.html',
  styleUrls: ['./header-menu.component.scss'],
})
export class HeaderMenuComponent implements OnInit {
  constructor(
    private router: Router,
    private layout: LayoutService,
    private layoutInit: LayoutInitService,
    private utils: Utils,
    private apiCalls: ApiCallsService,
    private route: ActivatedRoute
  ) {}

  setHiringManager: boolean = true;
  endPoints = EndPoints;
  switch_text = 'Switch to Vendor';
  logoutUrl: string = '/auth/logout';
  jobPostsUrl: string = '/job-posts';
  timeSheetUrl: string = '/timesheets';
  workOrderUrl: string = '/work-order';
  isActiveLink = false;
  auth: any;

  ngOnInit(): void {
    this.setWorkOrderActive();
    this.router.events.subscribe((ev) => {
      if (ev instanceof NavigationEnd) {
        this.setWorkOrderActive();
      }
    });

    let auth = this.utils.getAuth();
    this.auth = auth;
    // console.log(auth?.vendorId);
    if (auth?.vendorId) {
      this.switch_text = 'Switch to Recruiter';
      this.utils.setUser(auth?.['user-id'] || '');
      this.jobPostsUrl = '/job-posts';
      this.workOrderUrl = '/work-order';
      this.timeSheetUrl = '/timesheets';
      this.utils.setHiringManager('false');

      // this.setHiringManager = true;
      this.setHiringManager = false;
      this.getVendorDetails(auth.vendorId);
      this.utils.setVendorId(auth.vendorId);
    } else {
      this.switch_text = 'Switch to Vendor';
      this.jobPostsUrl = '/hm/job-posts';
      this.jobPostsUrl = '/hm/job-posts';
      this.workOrderUrl = '/hm/work-order';
      this.timeSheetUrl = '/hm/timesheets';
      this.utils.setUser(auth?.['user-id'] || '');
      this.utils.setHiringManager('true');

      // this.setHiringManager = false;
      this.setHiringManager = true;
    }
    let status = this.utils.isHiringManagerSet();

    if (status) {
      if (status == 'true') {
        this.setHiringManager = true;
      } else if (status == 'false') {
        this.setHiringManager = false;
        this.switch_text = 'Switch to Recruiter';
        this.utils.setVendorId(auth?.vendorId || '');
      }
    }

    if (this.setHiringManager) {
      this.jobPostsUrl = '/hm/job-posts';
      this.workOrderUrl = '/hm/work-order';
      this.utils.setUser(auth?.['user-id'] || '');
    } else {
      this.utils.setUser(auth?.['user-id'] || '');
      this.jobPostsUrl = '/job-posts';
      this.workOrderUrl = '/work-order';
    }
  }

  setWorkOrderActive() {
    if (this.router.url.includes('work-order')) {
      this.route.queryParams.subscribe((param) => {
        if (param['from'] == 'inbox') {
          this.isActiveLink = false;
        } else {
          this.isActiveLink = true;
        }
      });
    } else {
      this.isActiveLink = false;
    }
  }

  getVendorDetails(id: any) {
    let queryParam = {
      vendorCode: id,
    };
    this.apiCalls
      .get(this.endPoints.GET_VENDOR_DETAILS, queryParam)
      .pipe(
        catchError(async (error) => {
          throw error;
        })
      )
      .subscribe((response) => {
        sessionStorage.setItem('vendorDetails', JSON.stringify(response));
      });
  }

  calculateMenuItemCssClass(url: string): string {
    return checkIsActive(this.router.url, url) ? 'active' : '';
  }

  setBaseLayoutType(layoutType: LayoutType) {
    this.layoutInit.setBaseLayoutType(layoutType);
  }

  setToolbar(
    toolbarLayout: 'classic' | 'accounting' | 'extended' | 'reports' | 'saas'
  ) {
    const currentConfig = { ...this.layout.layoutConfigSubject.value };
    if (currentConfig && currentConfig.app && currentConfig.app.toolbar) {
      currentConfig.app.toolbar.layout = toolbarLayout;
      this.layout.saveBaseConfig(currentConfig);
    }
  }

  switchMode(event: any) {
    if (event.target.checked) {
      this.switch_text = 'Switch to Recruiter';
      this.utils.setUser('user-1');
      this.jobPostsUrl = '/job-posts';
      this.workOrderUrl = '/work-order';
      this.utils.setHiringManager('false');
      this.router.navigate(['/job-posts'], {
        queryParams: {
          pageNo: 1,
          pageSize: 10,
          status: 'ACTIVE',
        },
      });
      // this.setHiringManager = true;
      this.setHiringManager = false;
      this.utils.setVendorId('V101');
    } else {
      this.switch_text = 'Switch to Vendor';
      this.jobPostsUrl = '/hm/job-posts';
      this.workOrderUrl = '/hm/work-order';
      this.utils.setUser('user-11');
      this.utils.setHiringManager('true');
      this.router.navigate(['/hm/job-posts'], {
        queryParams: {
          pageNo: 1,
          pageSize: 10,
          status: 'ACTIVE',
        },
      });
      // this.setHiringManager = false;
      this.setHiringManager = true;
    }
  }

  logout() {
    this.apiCalls
      .get(this.endPoints.LOGOUT)
      .pipe(
        catchError(async (error) => {
          throw error;
        })
      )
      .subscribe((response) => {});
  }

  removeSessionStorage() {
    sessionStorage.removeItem('searchFilters');
    sessionStorage.removeItem('filterData');
  }
}

const getCurrentUrl = (pathname: string): string => {
  return pathname.split(/[?#]/)[0];
};

const checkIsActive = (pathname: string, url: string) => {
  const current = getCurrentUrl(pathname);
  if (!current || !url) {
    return false;
  }

  if (current === url) {
    return true;
  }

  if (current.indexOf(url) > -1) {
    return true;
  }

  return false;
};
