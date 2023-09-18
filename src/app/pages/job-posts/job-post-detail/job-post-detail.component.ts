import { ChangeDetectorRef, Component, OnInit, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { ActivatedRoute, Router } from '@angular/router';
import { catchError } from 'rxjs/internal/operators/catchError';
import {
  DrawerComponent,
  ToggleComponent,
} from 'src/app/_metronic/kt/components';
import { ModalComponent, ModalConfig } from 'src/app/_metronic/partials';
import EndPoints from 'src/app/common/endpoints';
import { ApiCallsService } from 'src/app/services/api-calls.service';
import { Utils } from 'src/app/services/utils';
import { Location } from '@angular/common';

@Component({
  selector: 'app-job-post-detail',
  templateUrl: './job-post-detail.component.html',
  styleUrls: ['./job-post-detail.component.scss'],
})
export class JobPostDetailComponent implements OnInit {
  // TODO: Job post detail -> downloading file should not leave page, irrespective of file type supported by browser or not.
  jobId: string;
  parentTab: string;
  loading = false;
  pageNo: string;
  pageSize: string;
  apiLoad = false;
  endPoints = EndPoints;
  jobDetails: any;
  documentsList: any[] = [];
  applicationDetails: any;
  applicationCompleteDetails: any;
  offerDetails: any[] = [];
  actionTaken = false;
  profilePic: any;
  applicationAttachement: any[] = [];
  timeSheetFrequencyList: any = {
    W: 'Weekly',
    '2W': 'Bi-Weekly',
    M: 'Monthly',
  };

  isSelectedTab: string = 'Details';
  vendorDetails: any;
  modalConfig: ModalConfig = {
    modalTitle: 'View Document',
    dismissButtonLabel: 'Cancel',
    closeButtonLabel: 'Save',
    hideFooter: this.hideFooter,
  };
  @ViewChild('modal') private modalComponent: ModalComponent;

  constructor(
    private route: ActivatedRoute,
    private apiCalls: ApiCallsService,
    private router: Router,
    private cdr: ChangeDetectorRef,
    private utils: Utils,
    private dialog: MatDialog,
    private location: Location
  ) {}

  ngOnInit(): void {
    this.vendorDetails = JSON.parse(sessionStorage.getItem('vendorDetails')!);
    this.route.queryParams.subscribe((param) => {
      this.jobId = param['jobId'];
      this.parentTab = param['tab'];
      this.isSelectedTab =
        this.parentTab == 'AppliedJob' ? 'Application' : 'Details';
      this.pageNo = param['pageNo'];
      this.pageSize = param['pageSize'];
    });
    if (this.isSelectedTab == 'Application') {
      this.getSelectedTab(this.isSelectedTab);
      this.getApplicationDetails();
    }
    this.getJobDetails();
  }

  // Application
  // Details

  async hideFooter(): Promise<boolean> {
    return true;
  }

  getSelectedTab(tab: string): void {
    this.isSelectedTab = tab;

    setTimeout(() => {
      DrawerComponent.hideAll();
      DrawerComponent.reinitialization();
    }, 100);
  }

  getApplicationDetails() {
    this.loading = true;
    let queryParam = {
      jpbPostId: this.jobId,
      vendorId: this.utils.getVendorId(),
    };
    this.apiCalls
      .get(this.endPoints.GET_APPL_DETAILS, queryParam)
      .pipe(
        catchError(async (error) => {
          this.loading = false;
          this.cdr.detectChanges();
          throw error;
        })
      )
      .subscribe((response) => {
        this.loading = false;
        this.applicationDetails = response;
        this.getApplicationCompleteDetails();
        this.getOfferDetails();
        this.getApplicationAttachment(this.applicationDetails.applicationId);
        this.cdr.detectChanges();
      });
  }

  getApplicationCompleteDetails() {
    this.loading = true;
    let queryParam = {
      workForceId: this.applicationDetails.workerId,
    };
    this.apiCalls
      .get(this.endPoints.GET_FULL_APPL_DETAILS, queryParam)
      .pipe(
        catchError(async (error) => {
          this.loading = false;
          this.cdr.detectChanges();
          throw error;
        })
      )
      .subscribe((response) => {
        this.loading = false;
        this.applicationCompleteDetails = response;
        this.getWorkForceProfilePic(this.applicationDetails.applicationId);
        this.cdr.detectChanges();
      });
  }

  getApplicationAttachment(id: string) {
    this.loading = true;
    this.apiLoad = false;
    let queryParam = {
      id: id,
      attachmentType: 'JOB_APPLICATION',
    };
    this.apiCalls
      .get(this.endPoints.GET_DOCUMENTS, queryParam)
      .pipe(
        catchError(async (error) => {
          this.loading = false;
          this.apiLoad = true;
          this.cdr.detectChanges();
          throw error;
        })
      )
      .subscribe((response) => {
        this.loading = false;
        this.apiLoad = true;
        this.applicationAttachement = response;
        this.cdr.detectChanges();
      });
  }

  getWorkForceProfilePic(id: string) {
    this.loading = true;
    this.apiCalls
      .getDocument(this.endPoints.GET_JOB_APPL_PIC, {
        jobApplicationId: id,
      })
      .pipe(
        catchError(async (err) => {
          this.utils.showErrorDialog(this.dialog, err);
          this.loading = false;
          console.log(id, err);
        })
      )
      .subscribe(async (response: any) => {
        this.profilePic =
          response.size > 0 ? await this.blobToBase64(response) : undefined;
        this.loading = false;
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

  getWorkExperience() {
    const years = Math.floor(this.applicationDetails?.workExpInMonths / 12);
    const months = this.applicationDetails?.workExpInMonths % 12;

    if (years > 0) {
      if (months > 0) {
        return `${years} years ${months} months`;
      } else {
        return `${years} years`;
      }
    } else {
      if (months) return `${months} months`;
      else return '0 month';
    }
  }

  getJobDetails() {
    this.loading = true;
    let queryParam = {
      id: this.jobId,
    };
    this.apiCalls
      .get(this.endPoints.GET_JOB_DETAILS, queryParam)
      .pipe(
        catchError(async (error) => {
          this.loading = false;
          this.cdr.detectChanges();
          console.log(error);
          throw error;
        })
      )
      .subscribe((response) => {
        this.loading = false;
        this.jobDetails = response;
        this.cdr.detectChanges();
      });
  }

  getOfferDetails() {
    this.loading = true;
    let queryParam = {
      jobApplicationId: this.applicationDetails.applicationId,
    };
    this.apiCalls
      .get(this.endPoints.GET_OFFER_LETTER_APPL, queryParam)
      .pipe(
        catchError(async (error) => {
          this.loading = false;
          this.cdr.detectChanges();
          console.log(error);
          throw error;
        })
      )
      .subscribe((response) => {
        this.loading = false;
        this.offerDetails = response;
        this.cdr.detectChanges();
      });
  }

  getJobDocuments(id: string) {
    this.loading = true;
    this.apiLoad = false;
    let queryParam = {
      id: id,
      attachmentType: 'JOB_POST',
    };
    this.apiCalls
      .get(this.endPoints.GET_DOCUMENTS, queryParam)
      .pipe(
        catchError(async (error) => {
          this.loading = false;
          this.apiLoad = true;
          this.cdr.detectChanges();
          throw error;
        })
      )
      .subscribe((response) => {
        this.loading = false;
        this.apiLoad = true;
        this.documentsList = response;
        this.cdr.detectChanges();
      });
  }

  offerLetterAction(status: string) {
    let msg = `Do you want to ${status} the offer ?`;
    this.utils.showDialogWithCancelButton(this.dialog, msg, (res: any) => {
      if (res) {
        let queryParam = {
          jobAppId: this.applicationDetails?.applicationId,
          offerId: this.offerDetails[0].id,
        };
        if (status == 'accept') {
          this.acceptOrRejectOfferLetter(
            status,
            queryParam,
            this.endPoints.ACCEPT_OFFER_LETTER
          );
        } else if (status == 'reject') {
          this.acceptOrRejectOfferLetter(
            status,
            queryParam,
            this.endPoints.REJECT_OFFER_LETTER
          );
        }
      }
      this.cdr.detectChanges();
    });
  }

  acceptOrRejectOfferLetter(status: any, queryParam: any, endpoint: any) {
    this.loading = true;
    this.apiCalls
      .post(endpoint, '', queryParam)
      .pipe(
        catchError(async (error) => {
          this.loading = false;
          this.cdr.detectChanges();
          throw error;
        })
      )
      .subscribe((response) => {
        this.loading = false;
        this.actionTaken = true;
        setTimeout(() => {
          this.openSuccessPopup(status);
        }, 100);
        this.cdr.detectChanges();
      });
  }

  openSuccessPopup(status: any) {
    let msg = `You have successfully ${status}ed the offer`;
    this.utils.showDialog(this.dialog, msg, () => {
      this.loading = false;
      this.cdr.detectChanges();
    });
  }

  getAttachment(id: string, name: string) {
    this.loading = true;
    let queryParam = {
      documentId: id,
    };
    this.apiCalls
      .getDocument(this.endPoints.GET_ATTACHMENT, queryParam)
      .pipe(
        catchError(async (error) => {
          this.loading = false;
          this.cdr.detectChanges();
          throw error;
        })
      )
      .subscribe((response) => {
        const url = window.URL.createObjectURL(response);
        const anchor = document.createElement('a');
        anchor.href = url;
        anchor.download = name;
        anchor.click();
        window.URL.revokeObjectURL(url);
        this.loading = false;
        this.cdr.detectChanges();
      });
  }

  pdfSrc = '';
  async openModal(documentId: any) {
    let queryParam = {
      documentId: documentId,
    };
    this.apiCalls
      .getDocument(this.endPoints.GET_ATTACHMENT, queryParam)
      .pipe(
        catchError(async (error) => {
          this.cdr.detectChanges();
          throw error;
        })
      )
      .subscribe(async (response) => {
        const src = window.URL.createObjectURL(response);
        this.pdfSrc = src;
        this.cdr.detectChanges();
        return await this.modalComponent.open();
      });
  }

  applyJob(id: string) {
    this.router.navigate(['/job-posts/job-seeker'], {
      queryParams: { jobId: id, tab: this.parentTab },
    });
  }
  goBack() {
    this.location.back();
  }

  getHiringManagerName(jobDetails: any) {
    return (
      jobDetails?.managerDetails?.firstName +
      ' ' +
      jobDetails?.managerDetails?.lastName
    );
  }

  getDocIcon(fileName: string) {
    return this.utils.getDocIcon(fileName);
  }

  displayedColumns: string[] = [
    'taskId',
    'taskName',
    'assignTo',
    'eta',
    'timeSpent',
    'progression',
    'status',
    'log',
  ];
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
  {
    taskId: 8865,
    taskName: 'Some task name that has lengthy characters',
    assignTo: 'Shirley Lopez',
    eta: '5 Days',
    timeSpent: '38 hrs',
    progression: '40%',
    status: 'In-progress',
  },
  {
    taskId: 8865,
    taskName: 'Some task name that has lengthy characters',
    assignTo: 'Shirley Lopez',
    eta: '5 Days',
    timeSpent: '38 hrs',
    progression: '50%',
    status: 'In-progress',
  },
  {
    taskId: 8865,
    taskName: 'Some task name that has lengthy characters',
    assignTo: 'Shirley Lopez',
    eta: '5 Days',
    timeSpent: '38 hrs',
    progression: '30%',
    status: 'In-progress',
  },
  {
    taskId: 8865,
    taskName: 'Some task name that has lengthy characters',
    assignTo: 'Shirley Lopez',
    eta: '5 Days',
    timeSpent: '38 hrs',
    progression: '40%',
    status: 'In-progress',
  },
  {
    taskId: 8865,
    taskName: 'Some task name that has lengthy characters',
    assignTo: 'Shirley Lopez',
    eta: '5 Days',
    timeSpent: '38 hrs',
    progression: '20%',
    status: 'In-progress',
  },
  {
    taskId: 8865,
    taskName: 'Some task name that has lengthy characters',
    assignTo: 'Shirley Lopez',
    eta: '5 Days',
    timeSpent: '38 hrs',
    progression: '40%',
    status: 'In-progress',
  },
  {
    taskId: 8865,
    taskName: 'Some task name that has lengthy characters',
    assignTo: 'Shirley Lopez',
    eta: '5 Days',
    timeSpent: '38 hrs',
    progression: '40%',
    status: 'In-progress',
  },
  {
    taskId: 8865,
    taskName: 'Some task name that has lengthy characters',
    assignTo: 'Shirley Lopez',
    eta: '5 Days',
    timeSpent: '38 hrs',
    progression: '10%',
    status: 'In-progress',
  },
  {
    taskId: 8865,
    taskName: 'Some task name that has lengthy characters',
    assignTo: 'Shirley Lopez',
    eta: '5 Days',
    timeSpent: '38 hrs',
    progression: '80%',
    status: 'In-progress',
  },
];
