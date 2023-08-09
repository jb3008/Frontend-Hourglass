import {
  Component,
  OnInit,
  ViewChild,
  ChangeDetectorRef,
  Input,
} from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import EndPoints from 'src/app/common/endpoints';
import { ApiCallsService } from 'src/app/services/api-calls.service';
import { Utils } from 'src/app/services/utils';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Observable, catchError, throwError } from 'rxjs';
import { AuthService } from 'src/app/modules/auth';
import { ModalComponent, ModalConfig } from 'src/app/_metronic/partials';

@Component({
  selector: 'app-attachment-logs-drawer',
  templateUrl: './attachment-logs-drawer.component.html',
})
export class AttachmentLogsDrawerComponent implements OnInit {
  constructor(
    private route: ActivatedRoute,
    private fb: FormBuilder,
    private snackBar: MatSnackBar,
    private apiCalls: ApiCallsService,
    private utils: Utils,
    private cdr: ChangeDetectorRef,
    private authService: AuthService
  ) {}
  pdfSrc: any;
  modalConfig: ModalConfig = {
    modalTitle: 'View Document',
    dismissButtonLabel: 'Cancel',
    closeButtonLabel: 'Save',
    hideFooter: this.hideFooter,
  };
  @ViewChild('modal') private modalComponent: ModalComponent;

  async hideFooter(): Promise<boolean> {
    return true;
  }
  ngOnInit(): void {
    console.log(this.timeSheetId);
    this.getDocuments();
  }
  ngOnChange(): void {
    console.log(this.timeSheetId);
    this.getDocuments();
  }
  @Input() timeSheetId: any;
  endPoints = EndPoints;
  isLoading = false;
  documentsList: any;
  documentsAllList: any;
  searchFilterInp: string;
  getDocuments() {
    let queryParam = {
      id: this.timeSheetId,
      attachmentType: 'TIMESHEET',
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
      );
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
}
