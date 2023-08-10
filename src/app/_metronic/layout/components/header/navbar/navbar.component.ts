import { ChangeDetectorRef, Component, Input, OnInit } from '@angular/core';
import { catchError } from 'rxjs';
import EndPoints from 'src/app/common/endpoints';
import { ApiCallsService } from 'src/app/services/api-calls.service';
import { Utils } from 'src/app/services/utils';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.scss'],
})
export class NavbarComponent implements OnInit {
  @Input() appHeaderDefaulMenuDisplay: boolean;
  @Input() isRtl: boolean;

  itemClass: string = 'ms-1 ms-lg-3';
  btnClass: string =
    'btn btn-icon btn-custom btn-icon-muted bg-white w-35px h-35px w-md-40px h-md-40px ';
  userAvatarClass: string = 'symbol-35px symbol-md-40px';
  btnIconClass: string = 'svg-icon-1';
  endPoints = EndPoints;
  auth: any;
  constructor(
    private utils: Utils,
    private apiCalls: ApiCallsService,
    private cdr: ChangeDetectorRef
  ) {}
  inboxLink = '';
  notificationCount: number = 0;
  ngOnInit(): void {
    let auth = this.utils.getAuth();
    this.auth = auth;
    // console.log(auth?.vendorId);
    if (auth?.vendorId) {
      this.inboxLink = 'inbox';
    } else {
      console.log('else auth?.vendorId', auth?.vendorId);
      this.inboxLink = 'hm/inbox';
    }

    this.getNotificationCounter();
    setInterval(() => {
      this.getNotificationCounter();
    }, 300000);
  }
  getNotificationCounter() {
    this.apiCalls
      .get(this.endPoints.GET_NOTIFICATION_COUNT, {})
      .pipe(
        catchError(async (error) => {
          throw error;
        })
      )
      .subscribe((response) => {
        this.notificationCount = response.count ? response.count : 0;
        this.cdr.detectChanges();
      });
  }
}
