import {
  ChangeDetectorRef,
  Component,
  EventEmitter,
  Input,
  OnInit,
  Output,
} from '@angular/core';
import EndPoints from 'src/app/common/endpoints';
import { ApiCallsService } from 'src/app/services/api-calls.service';
import { Utils } from 'src/app/services/utils';
import { Observable, catchError, throwError } from 'rxjs';
import { AuthService } from 'src/app/modules/auth';
import { MatSnackBar } from '@angular/material/snack-bar';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-inbox-reject-drawer',
  templateUrl: './inbox-reject-drawer.component.html',
})
export class InboxRejectDrawerComponent implements OnInit {
  @Input() timeSheetId: any;
  @Input() status: any;
  @Output() reloadPage = new EventEmitter<any>();
  statusModal: FormGroup;
  isLoading = false;
  endPoints = EndPoints;
  auth: any;
  constructor(
    private apiCalls: ApiCallsService,
    private utils: Utils,
    private snackBar: MatSnackBar,
    private cdr: ChangeDetectorRef,
    private authService: AuthService,
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private _formBuilder: FormBuilder
  ) {}

  ngOnInit(): void {
    this.auth = this.utils.getAuth();

    this.statusModal = this.fb.group({
      timeSheetId: [this.timeSheetId, Validators.required],
      status: ['REJECTED', Validators.required],
      comment: [''],
      documentList: [[]],
    });
  }
  ngOnChange() {
    this.auth = this.utils.getAuth();

    this.statusModal = this.fb.group({
      timeSheetId: [this.timeSheetId, Validators.required],
      status: ['REJECTED', Validators.required],
      comment: [''],
      documentList: [[]],
    });
  }

  droppedFiles(allFiles: File[], name: string): void {
    console.log('this.allFiles', allFiles);
    console.log(this.statusModal.controls[name].value);
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
        const docList = this.statusModal.controls[name].value;
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
        this.statusModal.controls[name].value.push(allFiles[i]);
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
      const docList = this.statusModal.controls[name].value;
      if (docList.length < 6) {
        if (this.utils.isFileExist(docList, file)) {
          this.utils.showSnackBarMessage(
            this.snackBar,
            'This file "' + file.name + '" already exist.'
          );
        } else {
          this.statusModal.controls[name].value.push(file);
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
    this.statusModal.controls[name].value.splice(index, 1);
  }

  async updateStatus() {
    const formData = new FormData();

    // stop here if form is invalid
    if (this.statusModal.invalid) {
      return;
    }

    this.isLoading = true;

    for (const key of Object.keys(this.statusModal.value)) {
      if (key != 'documentList') {
        const value = this.statusModal.value[key];

        if (value) {
          formData.append(key, value);
        }
      }
    }
    const formDataObj: any = {};
    formData.forEach((value, key) => (formDataObj[key] = value));
    this.apiCalls
      .post(this.endPoints.UPDATE_TIMESHEET_STATUS, formDataObj)
      .pipe(
        catchError(async (err) => {
          this.isLoading = false;
          setTimeout(() => {
            throw err;
          }, 10);
          this.utils.showSnackBarMessage(
            this.snackBar,
            err?.error?.msg ? err?.error?.msg : 'Something went wrong'
          );
          this.cdr.detectChanges();
        })
      )
      .subscribe(async (response) => {
        if (this.isLoading) {
          const file = this.statusModal.get('documentList')?.value;
          if (file.length) {
            const docFormData = new FormData();
            file.forEach((fileObj: File) => {
              const blob = new Blob([fileObj], { type: fileObj.type });
              docFormData.append('documentList', blob, fileObj.name);
            });

            docFormData.append('timeSheetId', this.timeSheetId);
            this.apiCalls
              .post(this.endPoints.UPLOAD_TIME_SHEET_DOCUMENT, docFormData)
              .pipe(
                catchError(async (err) => {
                  this.isLoading = false;
                  setTimeout(() => {
                    throw err;
                  }, 10);
                  this.utils.showSnackBarMessage(
                    this.snackBar,
                    'Something went wrong on upload timesheet-document'
                  );
                  this.cdr.detectChanges();
                })
              )
              .subscribe(async (response) => {
                if (this.isLoading) {
                  this.isLoading = false;
                  let closeBtn = document.getElementById(
                    'kt_inbox_reject_close'
                  );
                  closeBtn?.click();
                  this.reloadPage.emit(true);
                  this.cdr.detectChanges();
                  console.log('Uploaded with Doc');
                  this.utils.showSnackBarMessage(
                    this.snackBar,
                    'Time sheet status rejected successfully'
                  );
                }
              });
          } else {
            this.isLoading = false;
            let closeBtn = document.getElementById('kt_inbox_reject_close');
            closeBtn?.click();
            this.reloadPage.emit(true);
            this.cdr.detectChanges();
            this.utils.showSnackBarMessage(
              this.snackBar,
              'Time sheet status rejected successfully'
            );
          }
        }
      });
  }
}
