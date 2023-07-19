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
      mobilePhone: ['', Validators.required],
      dateOfBirth: ['', Validators.required],
      bloodGroup: [''],
      designation: ['', Validators.required],
      location: ['', Validators.required],
      currentAddress: ['', Validators.required],
      permanentAddress: ['', Validators.required],
      vendorId: [auth?.vendorId, Validators.required],
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
        const value = this.workForceData.value[key];
        if (value) {
          formData.append(key, value);
        }
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
}
