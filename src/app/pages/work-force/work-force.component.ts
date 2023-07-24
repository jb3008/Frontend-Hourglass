import {
  ChangeDetectorRef,
  Component,
  OnDestroy,
  OnInit,
  ViewChild,
} from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { ModalConfig, ModalComponent } from '../../_metronic/partials';
import EndPoints from 'src/app/common/endpoints';
import { ApiCallsService } from 'src/app/services/api-calls.service';
import { Utils } from 'src/app/services/utils';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Observable, catchError, throwError } from 'rxjs';
import { AuthService } from 'src/app/modules/auth';
@Component({
  selector: 'app-work-force',
  templateUrl: './work-force.component.html',
  styleUrls: ['./work-force.component.scss'],
})
export class WorkForceComponent implements OnInit {
  workForceData: FormGroup;
  workForceList: any = [];
  endPoints = EndPoints;
  isLoading = false;

  modalConfig: ModalConfig = {
    modalTitle: 'Employee',
    dismissButtonLabel: 'Cancel',
    closeButtonLabel: 'Save',
    hideFooter: this.hideFooter,
  };
  @ViewChild('modal') private modalComponent: ModalComponent;
  constructor(
    private fb: FormBuilder,
    private snackBar: MatSnackBar,
    private apiCalls: ApiCallsService,
    private utils: Utils,
    private cdr: ChangeDetectorRef,
    private authService: AuthService
  ) {}

  async openModal() {
    return await this.modalComponent.open();
  }
  async hideFooter(): Promise<boolean> {
    return true;
  }

  ngOnInit(): void {
    const auth = this.authService.getAuthFromLocalStorage();
    this.workForceData = this.fb.group({
      id: [''],

      firstName: ['', Validators.required],
      lastName: ['', Validators.required],
      gender: [''],
      workEmail: [
        '',
        Validators.compose([Validators.required, Validators.email]),
      ],
      personalEmail: [
        '',
        Validators.compose([Validators.required, Validators.email]),
      ],
      workPhone: ['', Validators.required],
      workExperience: ['', Validators.required],
      mobilePhone: ['', Validators.required],
      dateOfBirth: ['', Validators.required],
      bloodGroup: [''],
      designation: ['', Validators.required],
      location: ['', Validators.required],
      currentAddress: ['', Validators.required],
      permanentAddress: ['', Validators.required],
      vendorId: [auth?.vendorId, Validators.required],
      documentList: [[]],
    });
    this.getAllWorkForceList();
  }

  async save() {
    const formData = new FormData();

    if (this.workForceData.valid) {
      this.isLoading = true;
      if (this.workForceData.controls['dateOfBirth'].value) {
        this.workForceData.controls['dateOfBirth'].setValue(
          this.changeDateToUtc(this.workForceData.controls['dateOfBirth'].value)
        );
      }

      for (const key of Object.keys(this.workForceData.value)) {
        if (key != 'documentList') {
          const value = this.workForceData.value[key];

          if (value) {
            formData.append(key, value);
          }
        }
      }
      const file = this.workForceData.get('documentList')?.value;
      if (file.length != 0) {
        file.forEach((fileObj: File) => {
          const blob = new Blob([fileObj], { type: fileObj.type });
          formData.append('documentList', blob, fileObj.name);
        });
      }

      this.apiCalls
        .post(this.endPoints.CREATE_WORK_FORCE, formData)
        .pipe(
          catchError(async (err) => {
            this.isLoading = false;
            setTimeout(() => {
              throw err;
            }, 10);
            this.utils.showSnackBarMessage(
              this.snackBar,
              'Something went wrong'
            );
            this.cdr.detectChanges();
          })
        )
        .subscribe(async (response) => {
          this.isLoading = false;
          await this.modalComponent.closeModal();
          this.ngOnInit();
          this.utils.showSnackBarMessage(
            this.snackBar,
            'Member save successfully'
          );
        });
    } else {
      if (this.workForceData.controls['workEmail']?.errors?.email) {
        this.utils.showSnackBarMessage(
          this.snackBar,
          'Personal Email is invalid'
        );
        return false;
      }
      if (this.workForceData.controls['personalEmail']?.errors?.email) {
        this.utils.showSnackBarMessage(
          this.snackBar,
          'Personal Email is invalid'
        );
        return false;
      }
      this.utils.showSnackBarMessage(
        this.snackBar,
        'Please enter all required data'
      );
      return false;
    }
  }
  async closeModal() {
    return await this.modalComponent.closeModal();
  }
  changeDateToUtc(dateObj: any) {
    const date = new Date(dateObj);
    const utcDate = date.toISOString();
    return utcDate;
  }

  getAllWorkForceList() {
    this.isLoading = true;
    this.apiCalls
      .get(this.endPoints.LIST_WORK_FORCE, {})
      .pipe(
        catchError(async (err) => {
          this.utils.showSnackBarMessage(
            this.snackBar,
            'failed to fetch the work-force'
          );
          this.isLoading = false;
          throw err;
        })
      )
      .subscribe((response) => {
        this.workForceList = response;
        this.isLoading = false;
        this.cdr.detectChanges();
      });
  }

  droppedFiles(allFiles: File[], name: string): void {
    console.log('this.allFiles', allFiles);
    console.log(this.workForceData.controls[name].value);
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
        const docList = this.workForceData.controls[name].value;
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
        this.workForceData.controls[name].value.push(allFiles[i]);
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
      const docList = this.workForceData.controls[name].value;
      if (docList.length < 6) {
        if (this.utils.isFileExist(docList, file)) {
          this.utils.showSnackBarMessage(
            this.snackBar,
            'This file "' + file.name + '" already exist.'
          );
        } else {
          this.workForceData.controls[name].value.push(file);
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
    this.workForceData.controls[name].value.splice(index, 1);
  }
}
