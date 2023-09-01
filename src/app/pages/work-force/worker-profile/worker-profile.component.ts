import { Component, OnInit, ViewChild, ChangeDetectorRef } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import EndPoints from 'src/app/common/endpoints';
import { ApiCallsService } from 'src/app/services/api-calls.service';
import { Utils } from 'src/app/services/utils';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Observable, catchError, throwError } from 'rxjs';
import { AuthService } from 'src/app/modules/auth';
import { ModalComponent, ModalConfig } from 'src/app/_metronic/partials';
import { environment } from 'src/environments/environment';
import { MatDialog } from '@angular/material/dialog';

@Component({
  selector: 'app-worker-profile',
  templateUrl: './worker-profile.component.html',
  styleUrls: ['./worker-profile.component.scss'],
})
export class WorkerProfileComponent implements OnInit {
  workForceDocument: FormGroup;
  modalConfig: ModalConfig = {
    modalTitle: 'View Document',
    dismissButtonLabel: 'Cancel',
    closeButtonLabel: 'Save',
    hideFooter: this.hideFooter,
  };
  @ViewChild('modal') private modalComponent: ModalComponent;
  documentModalConfig: ModalConfig = {
    modalTitle: 'Document',
    dismissButtonLabel: 'Cancel',
    closeButtonLabel: 'Save',
    hideFooter: this.hideFooter,
  };
  @ViewChild('modalDocument') private documentModalComponent: ModalComponent;

  pdfSrc = '';
  constructor(
    private route: ActivatedRoute,
    private fb: FormBuilder,
    private snackBar: MatSnackBar,
    private apiCalls: ApiCallsService,
    private utils: Utils,
    private cdr: ChangeDetectorRef,
    private authService: AuthService,
    private dialog: MatDialog,
  ) {}

  async openModal(documentId: string) {
    this.pdfSrc =
      environment.apiUrl +
      this.endPoints.GET_ATTACHMENT +
      `?documentId=${documentId}`;

    this.cdr.detectChanges();
    return await this.modalComponent.open();
  }

  async openDocumentModal() {
    this.workForceDocument.controls['documentList'].setValue([]);
    return await this.documentModalComponent.open();
  }

  async closeDocumentModal() {
    return await this.documentModalComponent.closeModal();
  }

  async hideFooter(): Promise<boolean> {
    return true;
  }
  endPoints = EndPoints;
  isLoading = false;
  documentsList: any;
  documentsAllList: any;
  documentsCount: any;
  type: any;
  ngOnInit(): void {
    this.route.queryParams.subscribe((param) => {
      this.workForceId = param['workForceId'];
      this.type = param['type'];
      this.workForceDocument = this.fb.group({
        id: [this.workForceId, Validators.required],
        documentList: [[]],
      });

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
          this.utils.showErrorDialog(this.dialog, err);
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
        this.documentsCount = this.documentsList.length;
        console.log(this.documentsCount);

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

  getAttachment(documentId: any, name: any) {
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
        // window.open(url);
        const anchor = document.createElement('a');
        anchor.href = url;
        anchor.download = name;
        anchor.click();
        window.URL.revokeObjectURL(url);
        this.cdr.detectChanges();
      });
  }

  getAllWorkForceProfilePic(workForceId: any, element: any = []) {
    this.apiCalls
      .getDocument(this.endPoints.GET_WORK_FORCE_PIC, {
        workForceId: workForceId,
      })
      .pipe(catchError(async (err) => {
        this.utils.showErrorDialog(this.dialog, err);
      }))
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

  droppedFiles(allFiles: File[], name: string): void {
    console.log('this.allFiles', allFiles);
    console.log(this.workForceDocument.controls[name].value);
    const fileLength = allFiles.length;
    let flg: boolean = true;
    for (let i = 0; i < fileLength; i++) {
      const file = allFiles[i];

      if (file.type.indexOf('image') == 0) {
        this.utils.showSnackBarMessage(
          this.snackBar,
          'Please upload documents only'
        );
        flg = false;
        break;
      } else if (file.size > 2 * 1024 * 1024) {
        // check if file size is > 2 MB
        this.utils.showSnackBarMessage(
          this.snackBar,
          'Maximum allowed file size is 2 MB. Please choose another file.'
        );
        flg = false;
        break;
      } else {
        const docList = this.workForceDocument.controls[name].value;
        if (docList.length < 6) {
          if (this.utils.isFileExist(docList, file)) {
            this.utils.showSnackBarMessage(
              this.snackBar,
              'This file "' + file.name + '" already exist.'
            );
            flg = false;
            break;
          }
        } else {
          this.utils.showSnackBarMessage(
            this.snackBar,
            'Maximum 6 files can be added.'
          );
          flg = false;
          break;
        }
      }
    }
    if (flg) {
      for (let i = 0; i < fileLength; i++) {
        this.workForceDocument.controls[name].value.push(allFiles[i]);
      }
    }
  }

  selectFile(event: any, name: string) {
    const file = event.target.files[0];
    if (file.type.indexOf('image') == 0) {
      this.utils.showSnackBarMessage(
        this.snackBar,
        'Please upload documents only'
      );
    } else if (file.size > 2 * 1024 * 1024) {
      // check if file size is > 2 MB
      this.utils.showSnackBarMessage(
        this.snackBar,
        'Maximum allowed file size is 2 MB. Please choose another file.'
      );
    } else {
      const docList = this.workForceDocument.controls[name].value;
      if (docList.length < 6) {
        if (this.utils.isFileExist(docList, file)) {
          this.utils.showSnackBarMessage(
            this.snackBar,
            'This file "' + file.name + '" already exist.'
          );
        } else {
          this.workForceDocument.controls[name].value.push(file);
        }
      } else {
        this.utils.showSnackBarMessage(
          this.snackBar,
          'Maximum 6 files can be added.'
        );
      }
    }
  }

  clearFile(name: string, index: number) {
    this.workForceDocument.controls[name].value.splice(index, 1);
  }

  async save() {
    const formData = new FormData();

    // stop here if form is invalid
    if (this.workForceDocument.invalid) {
      return;
    }

    this.isLoading = true;

    for (const key of Object.keys(this.workForceDocument.value)) {
      if (key != 'documentList') {
        const value = this.workForceDocument.value[key];

        if (value) {
          formData.append('workForceId', value);
        }
      }
    }
    const file = this.workForceDocument.get('documentList')?.value;
    if (file.length != 0) {
      file.forEach((fileObj: File) => {
        const blob = new Blob([fileObj], { type: fileObj.type });
        formData.append('documentList', blob, fileObj.name);
      });
    }

    this.apiCalls
      .post(this.endPoints.UPLOAD_WORK_FORCE_DOCUMENT, formData)
      .pipe(
        catchError(async (err) => {
          this.isLoading = false;
          setTimeout(() => {
            throw err;
          }, 10);
          this.utils.showErrorDialog(this.dialog, err);
          this.cdr.detectChanges();
        })
      )
      .subscribe(async (response) => {
        if (this.isLoading) {
          this.isLoading = false;
          await this.documentModalComponent.closeModal();
          this.ngOnInit();
          this.utils.showSnackBarMessage(
            this.snackBar,
            'Document save successfully'
          );
        }
      });
  }
}
