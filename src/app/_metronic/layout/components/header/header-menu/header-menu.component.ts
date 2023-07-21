import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { LayoutType } from '../../../core/configs/config';
import { LayoutInitService } from '../../../core/layout-init.service';
import { LayoutService } from '../../../core/layout.service';
import { Utils } from 'src/app/services/utils';

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
    private utils: Utils
  ) {}

  setHiringManager: boolean = true;
  switch_text = 'Switch to Vendor';
  logoutUrl: string = '/auth/logout';
  jobPostsUrl: string = '/job-posts';
  workOrderUrl: string = '/work-order';
  ngOnInit(): void {
    let auth = this.utils.getAuth();
    // console.log(auth?.vendorId);
    if (auth?.vendorId) {
      this.switch_text = 'Switch to Recruiter';
      this.utils.setUser(auth?.['user-id'] || '');
      this.jobPostsUrl = '/job-posts';
      this.workOrderUrl = '/work-order';
      this.utils.setHiringManager('false');

      // this.setHiringManager = true;
      this.setHiringManager = false;
      this.utils.setVendorId(auth.vendorId);
    } else {
      this.switch_text = 'Switch to Vendor';
      this.jobPostsUrl = '/hm/job-posts';
      this.workOrderUrl = '/hm/work-order';
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
      this.router.navigate(['/job-posts']);
      // this.setHiringManager = true;
      this.setHiringManager = false;
      this.utils.setVendorId('V101');
    } else {
      this.switch_text = 'Switch to Vendor';
      this.jobPostsUrl = '/hm/job-posts';
      this.workOrderUrl = '/hm/work-order';
      this.utils.setUser('user-11');
      this.utils.setHiringManager('true');
      this.router.navigate(['/hm/job-posts']);
      // this.setHiringManager = false;
      this.setHiringManager = true;
    }
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
