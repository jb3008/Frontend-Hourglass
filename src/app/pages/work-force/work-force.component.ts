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
  imagePath: any;
  profilePicDoc: any = null;
  isEngagedWorker: string = 'Engaged';
  submitted = false;
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
    this.profilePicDoc = null;
    this.imagePath = undefined;
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
      workPhone: [
        '',
        Validators.compose([
          Validators.required,
          Validators.pattern('^[0-9]*$'),
        ]),
      ],
      workExperience: [
        '',
        Validators.compose([
          Validators.required,
          Validators.pattern('^[0-9]*$'),
        ]),
      ],
      mobilePhone: [
        '',
        Validators.compose([
          Validators.required,
          Validators.pattern('^[0-9]*$'),
        ]),
      ],
      dateOfBirth: ['', Validators.required],
      bloodGroup: [''],
      designation: ['', Validators.required],
      location: ['', Validators.required],
      currentAddress: ['', Validators.required],
      permanentAddress: ['', Validators.required],
      vendorId: [auth?.vendorId, Validators.required],
      documentList: [[]],
      createUser: [true],
    });
    this.getAllWorkForceList();
  }
  get f() {
    return this.workForceData.controls;
  }
  async save() {
    const formData = new FormData();
    this.submitted = true;

    // stop here if form is invalid
    if (this.workForceData.invalid) {
      return;
    }

    this.isLoading = true;
    this.cdr.detectChanges();
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
          this.utils.showSnackBarMessage(this.snackBar, 'Something went wrong');
          this.cdr.detectChanges();
        })
      )
      .subscribe(async (response) => {
        if (this.isLoading) {
          if (this.profilePicDoc) {
            const imageFormData = new FormData();
            const blob = new Blob([this.profilePicDoc], {
              type: this.profilePicDoc.type,
            });
            imageFormData.append(
              'profilePicDoc',
              blob,
              this.profilePicDoc.name
            );
            imageFormData.append('workForceId', response);
            this.apiCalls
              .post(this.endPoints.UPLOAD_WORK_FORCE_PIC, imageFormData)
              .pipe(
                catchError(async (err) => {
                  this.isLoading = false;
                  setTimeout(() => {
                    throw err;
                  }, 10);
                  this.utils.showSnackBarMessage(
                    this.snackBar,
                    'Something went wrong on upload profile-pic'
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
                  'Employee save successfully'
                );
              });
          } else {
            this.isLoading = false;
            await this.modalComponent.closeModal();
            this.ngOnInit();
            this.utils.showSnackBarMessage(
              this.snackBar,
              'Employee save successfully'
            );
          }
        }
      });
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
    let q =
      this.isEngagedWorker === 'All'
        ? {}
        : this.isEngagedWorker === 'Free'
        ? {
            isEngagedWorker: false,
          }
        : {
            isEngagedWorker: true,
          };
    this.apiCalls
      .get(this.endPoints.LIST_WORK_FORCE, q)
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
        for (let index = 0; index < this.workForceList.length; index++) {
          const element = this.workForceList[index];
          this.getAllWorkForceProfilePic(element.workForceId, element);
        }
        this.isLoading = false;
        this.cdr.detectChanges();
      });
  }
  getAllWorkForceProfilePic(workForceId: any, element: any = []) {
    this.apiCalls
      .getDocument(this.endPoints.GET_WORK_FORCE_PIC, {
        workForceId: workForceId,
      })
      .pipe(
        catchError(async (err) => {
          console.log(workForceId, err);
        })
      )
      .subscribe(async (response: any) => {
        element.profile =
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

  selectImage(event: any) {
    const reader = new FileReader();
    this.profilePicDoc = null;
    const file = event.target.files[0];
    if (file.type.indexOf('image') == -1) {
      this.utils.showSnackBarMessage(
        this.snackBar,
        'Only images are supported.'
      );
    } else if (file.size > 2 * 1024 * 1024) {
      // check if file size is > 2 MB
      this.utils.showSnackBarMessage(
        this.snackBar,
        'Maximum allowed file size is 2 MB. Please choose another file.'
      );
    } else {
      this.profilePicDoc = file;
      reader.readAsDataURL(file);
      reader.onload = () => {
        this.imagePath = reader.result;
        this.cdr.detectChanges();
      };
    }
  }
}
