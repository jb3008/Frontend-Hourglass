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
import { ActivatedRoute } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
@Component({
  selector: 'app-work-force',
  templateUrl: './work-force.component.html',
  styleUrls: ['./work-force.component.scss'],
})
export class WorkForceComponent implements OnInit {
  workForceData: FormGroup;
  workForceEditData: FormGroup;
  workForceList: any = [];
  endPoints = EndPoints;
  isLoading = false;
  imagePath: any;
  profilePicDoc: any = null;
  isEngagedWorker: string = 'Engaged';
  submitted = false;
  today: any = new Date();
  modalConfig: ModalConfig = {
    modalTitle: 'Employee',
    dismissButtonLabel: 'Cancel',
    closeButtonLabel: 'Save',
    hideFooter: this.hideFooter,
  };
  modalEditConfig: ModalConfig = {
    modalTitle: 'Employee',
    dismissButtonLabel: 'Cancel',
    closeButtonLabel: 'Save',
    hideFooter: this.hideFooter,
  };
  @ViewChild('modal') private modalComponent: ModalComponent;
  @ViewChild('modalEdit') private modalEditComponent: ModalComponent;
  workForceDetails: any = null;
  workForceId: any;
  constructor(
    private route: ActivatedRoute,
    private fb: FormBuilder,
    private snackBar: MatSnackBar,
    private apiCalls: ApiCallsService,
    private utils: Utils,
    private cdr: ChangeDetectorRef,
    private authService: AuthService,
    private dialog: MatDialog
  ) {}

  async openModal() {
    const auth = this.utils.getAuth();
    this.workForceData = this.fb.group({
      id: [''],

      firstName: ['', Validators.required],
      lastName: ['', Validators.required],
      gender: ['Male', Validators.required],
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
    return await this.modalComponent.open();
  }

  async openEditModal() {
    const auth = this.utils.getAuth();
    this.workForceEditData = this.fb.group({
      id: [''],

      firstName: ['', Validators.required],
      lastName: ['', Validators.required],
      gender: ['Male', Validators.required],
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
      createUser: [true],
      workForceId: [],
    });
    this.getWorkForceDetails();
    return await this.modalEditComponent.open();
  }
  async hideFooter(): Promise<boolean> {
    return true;
  }

  ngOnInit(): void {
    this.route.queryParams.subscribe((param) => {
      if (param.type) {
        this.isEngagedWorker = param.type;
      }
      const auth = this.utils.getAuth();
      this.profilePicDoc = null;
      this.imagePath = undefined;
      this.workForceId = undefined;
      this.workForceData = this.fb.group({
        id: [''],

        firstName: ['', Validators.required],
        lastName: ['', Validators.required],
        gender: ['Male', Validators.required],
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

      this.workForceEditData = this.fb.group({
        id: [''],

        firstName: ['', Validators.required],
        lastName: ['', Validators.required],
        gender: ['Male', Validators.required],
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
        createUser: [true],
        workForceId: [],
      });
      this.getAllWorkForceList();
    });
  }

  get f() {
    return this.workForceData.controls;
  }
  get editForm() {
    return this.workForceEditData.controls;
  }
  async save() {
    this.cdr.detectChanges();
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

  async closeEditModal() {
    return await this.modalEditComponent.closeModal();
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

  numbersOnly(event: any) {
    return this.utils.numberOnly(event);
  }

  getWorkForceDetails() {
    console.log(this.workForceId);

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
        this.isLoading = false;

        this.workForceDetails = response;
        this.workForceEditData.controls['firstName'].setValue(
          this.workForceDetails.firstName
        );
        this.workForceEditData.controls['lastName'].setValue(
          this.workForceDetails.lastName
        );
        if (this.workForceDetails.gender === 'Male') {
          this.workForceEditData.controls['gender'].setValue('Male');
        } else if (this.workForceDetails.gender === 'Female') {
          this.workForceEditData.controls['gender'].setValue('Female');
        } else if (this.workForceDetails.gender === 'Other') {
          this.workForceEditData.controls['gender'].setValue('Other');
        } else {
          this.workForceEditData.controls['gender'].setValue('Male');
        }
        this.workForceEditData.controls['workEmail'].setValue(
          this.workForceDetails.workEmail
        );
        this.workForceEditData.controls['personalEmail'].setValue(
          this.workForceDetails.personalEmail
        );
        this.workForceEditData.controls['workPhone'].setValue(
          this.workForceDetails.workPhone
        );
        this.workForceEditData.controls['mobilePhone'].setValue(
          this.workForceDetails.mobilePhone
        );
        this.workForceEditData.controls['workExperience'].setValue(
          this.workForceDetails.workExperience
        );
        this.workForceEditData.controls['dateOfBirth'].setValue(
          new Date(this.workForceDetails.dateOfBirth)
        );
        this.workForceEditData.controls['bloodGroup'].setValue(
          this.workForceDetails.bloodGroup
        );
        this.workForceEditData.controls['designation'].setValue(
          this.workForceDetails.designation
        );
        this.workForceEditData.controls['location'].setValue(
          this.workForceDetails.location
        );
        this.workForceEditData.controls['currentAddress'].setValue(
          this.workForceDetails.currentAddress
        );
        this.workForceEditData.controls['permanentAddress'].setValue(
          this.workForceDetails.permanentAddress
        );
        this.workForceEditData.controls['bloodGroup'].setValue(
          this.workForceDetails.bloodGroup
        );

        console.log(this.workForceDetails);

        this.cdr.detectChanges();
        this.getAllWorkForceProfilePic(this.workForceId, this.workForceDetails);
      });
  }

  async saveEditWorkForce() {
    const formData: any = new Object();
    this.submitted = true;
    this.workForceEditData.controls['id'].setValue(this.workForceId);
    this.workForceEditData.controls['workForceId'].setValue(this.workForceId);

    // stop here if form is invalid
    if (this.workForceEditData.invalid) {
      return;
    }

    this.isLoading = true;
    this.cdr.detectChanges();
    if (this.workForceEditData.controls['dateOfBirth'].value) {
      this.workForceEditData.controls['dateOfBirth'].setValue(
        this.changeDateToUtc(
          this.workForceEditData.controls['dateOfBirth'].value
        )
      );
    }

    for (const key of Object.keys(this.workForceEditData.value)) {
      if (key != 'documentList') {
        const value = this.workForceEditData.value[key];

        if (value) {
          formData[key] = value;
        }
      }
    }

    console.log(this.workForceEditData);
    this.apiCalls
      .put(this.endPoints.UPDATE_WORK_FORCE, formData)
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
            imageFormData.append('workForceId', this.workForceId);
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
                await this.modalEditComponent.closeModal();
                this.ngOnInit();
                this.utils.showSnackBarMessage(
                  this.snackBar,
                  'Employee update successfully'
                );
              });
          } else {
            this.isLoading = false;
            await this.modalEditComponent.closeModal();
            this.ngOnInit();
            this.utils.showSnackBarMessage(
              this.snackBar,
              'Employee update successfully'
            );
          }
        }
      });
  }
  deleteTheWorkForce() {
    this.isLoading = true;

    let queryObj = {
      workForceid: this.workForceId,
    };
    this.apiCalls
      .deleteWithTextResponse(this.endPoints.DELETE_WORK_FORCE, queryObj)
      .pipe(
        catchError(async (err) => {
          this.utils.showSnackBarMessage(
            this.snackBar,
            'failed to delete the work force'
          );
          this.isLoading = false;
          this.cdr.detectChanges();
          throw err;
        })
      )
      .subscribe((response) => {
        this.isLoading = false;
        this.ngOnInit();
        this.utils.showSnackBarMessage(
          this.snackBar,
          'Employee deleted successfully'
        );
        this.cdr.detectChanges();
      });
  }

  delete() {
    let msg = 'Do you want to delete this employee?';
    this.utils.showDialogWithCancelButton(this.dialog, msg, (res: any) => {
      this.isLoading = false;
      if (res) {
        this.deleteTheWorkForce();
      }
      this.cdr.detectChanges();
    });
  }
}
