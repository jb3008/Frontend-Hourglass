import { Component, OnInit, ViewChild, ChangeDetectorRef } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import EndPoints from 'src/app/common/endpoints';
import { ApiCallsService } from 'src/app/services/api-calls.service';
import { Utils } from 'src/app/services/utils';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Observable, catchError, throwError } from 'rxjs';
import { AuthService } from 'src/app/modules/auth';
import { ModalComponent, ModalConfig } from 'src/app/_metronic/partials';

@Component({
  selector: 'app-worker-profile',
  templateUrl: './worker-profile.component.html',
  styleUrls: ['./worker-profile.component.scss'],
})
export class WorkerProfileComponent implements OnInit {
  modalConfig: ModalConfig = {
    modalTitle: 'View Document',
    dismissButtonLabel: 'Cancel',
    closeButtonLabel: 'Save',
    hideFooter: this.hideFooter,
  };
  @ViewChild('modal') private modalComponent: ModalComponent;
  pdfSrc = '';
  constructor(
    private route: ActivatedRoute,

    private snackBar: MatSnackBar,
    private apiCalls: ApiCallsService,
    private utils: Utils,
    private cdr: ChangeDetectorRef,
    private authService: AuthService
  ) {}

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
        console.log(this.pdfSrc);
        this.cdr.detectChanges();
        return await this.modalComponent.open();
      });
  }
  async hideFooter(): Promise<boolean> {
    return true;
  }
  endPoints = EndPoints;
  isLoading = false;
  documentsList: any;
  documentsAllList: any;
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
        this.getAllWorkForceProfilePic(this.workForceId);
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
          throw error;
        })
      )
      .subscribe((response) => {
        this.isLoading = false;
        this.documentsList = response.filter(
          (r: any) => r.type !== 'PROFILE_PIC_DOC'
        );
        this.documentsAllList = JSON.parse(JSON.stringify(this.documentsList));
        this.cdr.detectChanges();
      });
  }
  searchDoc() {
    if (this.searchFilterInp.length > 2) {
      this.documentsList = this.documentsAllList.filter((x: any) =>
        new RegExp(this.searchFilterInp, 'i').test(x.fileName)
      )[0];
    } else if (this.searchFilterInp.length == 0) {
      this.documentsList = this.documentsAllList;
    }
  }

  getAttachment(documentId: any) {
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
      .subscribe((response) => {
        const url = window.URL.createObjectURL(response);
        window.open(url);
        this.cdr.detectChanges();
      });
  }

  getAllWorkForceProfilePic(workForceId: any, element: any = []) {
    this.apiCalls
      .getDocument(this.endPoints.GET_WORK_FORCE_PIC, {
        workForceId: workForceId,
      })
      .pipe(catchError(async (err) => {}))
      .subscribe(async (response: any) => {
        this.workForceDetails.profile =
          response.size > 0 ? await this.blobToBase64(response) : undefined;

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
}
