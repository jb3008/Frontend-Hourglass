import {
  ChangeDetectorRef,
  Component,
  EventEmitter,
  Input,
  OnChanges,
  OnInit,
  Output,
  ViewChild,
} from '@angular/core';
import {
  FormBuilder,
  FormControl,
  FormGroup,
  Validators,
} from '@angular/forms';
import { MatAutocompleteTrigger } from '@angular/material/autocomplete';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ActivatedRoute } from '@angular/router';
import { Observable, map, startWith } from 'rxjs';
import { catchError } from 'rxjs/internal/operators/catchError';
import EndPoints from 'src/app/common/endpoints';
import { ApiCallsService } from 'src/app/services/api-calls.service';
import { Utils } from 'src/app/services/utils';

@Component({
  selector: 'app-new-task-drawer',
  templateUrl: './new-task-drawer.component.html',
})
export class NewTaskDrawerComponent implements OnInit, OnChanges {
  constructor(
    private fb: FormBuilder,
    private apiCalls: ApiCallsService,
    private utils: Utils,
    private snackBar: MatSnackBar,
    private dialog: MatDialog,
    private cdr: ChangeDetectorRef,
    private route: ActivatedRoute
  ) {}

  taskData: FormGroup;
  endpoints = EndPoints;
  isLoading = false;
  assigneeList: any[] = [];
  assigneeFilteredList: Observable<any[]>;
  @Output() getList = new EventEmitter<any>();
  @Input() vendorId: any;
  @Input() taskDetails: any;
  @Input() statusLists: any;
  workOrderID: any;
  assigneeCntrl = new FormControl();
  @ViewChild(MatAutocompleteTrigger, { read: MatAutocompleteTrigger })
  assigneeSearch: MatAutocompleteTrigger;

  ngOnInit(): void {
    this.assigneeCntrl.setValue(null);
    this.route.queryParams.subscribe((param) => {
      this.workOrderID = param['workOrderId'];
    });
    this.taskData = this.fb.group({
      title: ['', Validators.required],
      assigneeId: ['', Validators.required],
      startDate: ['', Validators.required],
      priority: ['', Validators.required],
      expectedFinishDate: ['', Validators.required],
      comments: ['', Validators.required],
      estimatedTime: ['', Validators.required],
      status: ['', Validators.required],
      documentList: [[]],
    });

    // this.getAssigneeList();
  }

  ngOnChanges(changes: any) {
    if (changes?.taskDetails?.currentValue) {
      this.taskDetails = changes.taskDetails.currentValue;
      this.taskData.addControl('status', ['', Validators.required]);
      this.setEditValuesOnUi();
    }
    if (changes?.statusLists?.currentValue.length > 0) {
      this.statusLists = changes.statusLists.currentValue;
    }
  }

  allFiles: File[] = [];

  droppedFiles(allFiles: File[]): void {
    console.log('this.allFiles');
    const filesAmount = allFiles.length;
    for (let i = 0; i < filesAmount; i++) {
      const file = allFiles[i];
      this.allFiles.push(file);
    }
    console.log(this.allFiles);
  }

  showSearchResult(data: any) {
    return this.assigneeList.filter((obj) => {
      let fullName = `${obj.firstName} ${obj.lastName}`.toLowerCase();
      if (data && typeof data === 'object') {
        data = data.firstName + ' ' + data.lastName;
      }
      let searchData = data?.toLowerCase();
      let filteredData = fullName?.includes(searchData);
      return filteredData;
    });
  }

  displayFn(assignee: any): string {
    return assignee ? `${assignee.firstName} ${assignee.lastName}` : '';
  }

  setAssigneeValue(event: any) {
    let value = event.option.value.userId;
    this.taskData.controls['assigneeId'].setValue(value);
  }

  getAssigneeList() {
    const queryParam = {
      vendorId: this.vendorId,
    };
    this.apiCalls
      .get(this.endpoints.GET_VENDOR_STAFF_DETAILS, queryParam)
      .pipe(
        catchError(async (err) => {
          this.utils.showErrorDialog(this.dialog, err);
        })
      )
      .subscribe((response) => {
        this.assigneeList = response;
        this.getFilteredListForAssignee();
      });
  }
  getVendors(event: any) {
    let searchTerm = '';
    searchTerm = event;

    let queryParams = {
      text: searchTerm,
      vendorId: this.utils.getVendorId()
        ? this.utils.getVendorId()
        : this.vendorId,
    };
    if (searchTerm.length > 0) {
      this.apiCalls
        .get(this.endpoints.GET_VENDOR_STAFF_DETAILS, queryParams)
        .pipe(
          catchError(async (err) => {
            this.utils.showErrorDialog(this.dialog, err);
            setTimeout(() => {
              throw err;
            }, 10);
            this.cdr.detectChanges();
          })
        )
        .subscribe((response) => {
          this.assigneeFilteredList = this.assigneeCntrl.valueChanges.pipe(
            startWith(''),
            map((value) => response)
          );

          this.cdr.detectChanges();
        });
    } else {
      this.assigneeFilteredList = this.assigneeCntrl.valueChanges.pipe(
        startWith(''),
        map((value) => [])
      );
    }
  }

  getFilteredListForAssignee(reset?: string) {
    if (reset) {
      this.taskData.controls['assigneeId'].setValue('');
    }
    this.assigneeFilteredList = this.assigneeCntrl.valueChanges.pipe(
      startWith(''),
      map((value) => this.showSearchResult(value))
    );
  }

  numbersOnly(event: any) {
    return this.utils.numberOnly(event);
  }

  selectFile(event: any) {
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
      const docList = this.taskData.controls['documentList']?.value;
      if (docList?.length < 6) {
        if (this.utils.isFileExist(docList, file)) {
          this.utils.showSnackBarMessage(
            this.snackBar,
            'This file "' + file.name + '" already exist.'
          );
        } else {
          this.taskData.controls['documentList'].value.push(file);
        }
      } else {
        this.utils.showSnackBarMessage(
          this.snackBar,
          'Maximum 6 files can be added.'
        );
      }
    }
  }

  clearFile(index: number) {
    this.taskData.controls['documentList'].value.splice(index, 1);
  }

  clearFileInput(element: any) {
    this.utils.clearFileInput(element);
  }

  setEditValuesOnUi() {
    this.assigneeCntrl.setValue(this.taskDetails.userDetail);
    this.taskData.patchValue({
      title: this.taskDetails.title,
      assigneeId: this.taskDetails.assigneeId,
      priority: this.taskDetails.priority,
      status: this.taskDetails.status,
      startDate: this.taskDetails.startDate,
      expectedFinishDate: this.taskDetails.finishDate,
      comments: this.taskDetails.comments,
      estimatedTime: this.taskDetails.estimatedTime,
    });
  }

  submitTask() {
    this.isLoading = true;
    const formData = new FormData();
    if (!this.taskDetails) {
      this.taskData.removeControl('status');
    }
    if (this.taskData.valid) {
      this.taskData.controls['startDate'].setValue(
        this.changeDateToUtc(this.taskData.controls['startDate'].value)
      );
      this.taskData.controls['expectedFinishDate'].setValue(
        this.changeDateToUtc(this.taskData.controls['expectedFinishDate'].value)
      );
      this.isLoading = true;
      for (const key of Object.keys(this.taskData.value)) {
        if (key !== 'documentList') {
          const value = this.taskData.value[key];
          formData.append(key, value);
        } else {
          const file = this.taskData.controls['documentList'].value;
          if (file && file?.length != 0) {
            file.forEach((fileObj: File) => {
              const blob = new Blob([fileObj], { type: fileObj.type });
              formData.append(key, blob, fileObj.name);
            });
          }
        }
      }
      if (this.taskDetails) {
        formData.append('id', this.taskDetails.taskId);
      }
      if (!this.taskDetails) formData.append('status', 'IN_PROGRESS');

      formData.append('workOrderId', this.workOrderID);

      this.apiCalls
        .post(
          this.taskDetails == ''
            ? this.endpoints.CREATE_TASK
            : this.endpoints.UPDATE_TASK,
          formData
        )
        .pipe(
          catchError(async (err) => {
            this.utils.showErrorDialog(this.dialog, err);
            this.isLoading = false;
            setTimeout(() => {
              throw err;
            }, 10);
            this.cdr.detectChanges();
          })
        )
        .subscribe((response) => {
          if (response?.success == 'false') {
            this.isLoading = false;
            this.utils.showSnackBarMessage(this.snackBar, response.msg);
          } else {
            if (this.isLoading) {
              // isLoading = true indicates no error.
              this.openSuccessPopup();
            }
          }
          this.cdr.detectChanges();
        });
    } else {
      this.isLoading = false;
      this.cdr.detectChanges();
      this.utils.showSnackBarMessage(
        this.snackBar,
        'Please enter all required data'
      );
    }
  }

  openSuccessPopup() {
    this.isLoading = false;
    let msg = 'Your Task is successfully created';
    this.utils.showDialog(this.dialog, msg, () => {
      this.isLoading = false;
      let closeBtn = document.getElementById('kt_new_task_close');
      closeBtn?.click();
      this.cdr.detectChanges();
      this.getList.emit();
    });
  }

  changeDateToUtc(dateObj: any) {
    const date = new Date(dateObj);
    const utcDate = date.toISOString();
    return utcDate;
  }
}
