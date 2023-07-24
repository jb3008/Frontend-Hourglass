import { Component, OnInit, ViewChild, ChangeDetectorRef } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import EndPoints from 'src/app/common/endpoints';
import { ApiCallsService } from 'src/app/services/api-calls.service';
import { Utils } from 'src/app/services/utils';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Observable, catchError, throwError } from 'rxjs';
import { AuthService } from 'src/app/modules/auth';

@Component({
  selector: 'app-worker-profile',
  templateUrl: './worker-profile.component.html',
  styleUrls: ['./worker-profile.component.scss'],
})
export class WorkerProfileComponent implements OnInit {
  constructor(
    private route: ActivatedRoute,

    private snackBar: MatSnackBar,
    private apiCalls: ApiCallsService,
    private utils: Utils,
    private cdr: ChangeDetectorRef,
    private authService: AuthService
  ) {}
  endPoints = EndPoints;
  isLoading = false;
  documentsList: any;
  ngOnInit(): void {
    this.route.queryParams.subscribe((param) => {
      this.workForceId = param['workForceId'];
      this.geWorkForce();
    });
  }
  // @ViewChild("searchFilterInp") searchFilterInp: HTMLInputElement;
  workForceId: string;
  workForceDetails: any;
  searchFilterInp: string;

  isSelectedTab: string = 'Details';
  getSelectedTab(tab: string): void {
    console.log(tab);
    this.isSelectedTab = tab;
    // this.searchFilterInp.value =''
  }

  geWorkForce() {
    this.isLoading = true;
    this.apiCalls
      .get(this.endPoints.GET_WORK_FORCE, {
        workForceId: this.workForceId,
      })
      .pipe(
        catchError(async (err) => {
          this.utils.showSnackBarMessage(
            this.snackBar,
            'failed to fetch the work-force-detail'
          );
          this.isLoading = false;
          throw err;
        })
      )
      .subscribe((response) => {
        this.workForceDetails = response;
        this.cdr.detectChanges();
        this.getDocuments();
      });
  }
  getDocuments() {
    let queryParam = {
      id: this.workForceId,
      attachmentType: 'WORK_FORCE',
    };
    this.apiCalls
      .get(this.endPoints.GET_DOCUMENTS, queryParam)
      .pipe(
        catchError(async (error) => {
          this.isLoading = false;
          this.cdr.detectChanges();
          console.log(error);
          throw error;
        })
      )
      .subscribe((response) => {
        this.isLoading = false;
        this.documentsList = response;
        this.cdr.detectChanges();
      });
  }
}
