import {
  AfterViewInit,
  ChangeDetectorRef,
  Component,
  OnInit,
} from '@angular/core';
import { NgbAccordionModule } from '@ng-bootstrap/ng-bootstrap';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import {
  DrawerComponent,
  ToggleComponent,
} from 'src/app/_metronic/kt/components';
import EndPoints from 'src/app/common/endpoints';
import { ApiCallsService } from 'src/app/services/api-calls.service';
import { Utils } from 'src/app/services/utils';
import { AuthService } from 'src/app/modules/auth';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Observable, catchError, throwError } from 'rxjs';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
@Component({
  selector: 'app-new-timesheet',
  templateUrl: './new-timesheet.component.html',
  styleUrls: ['./../timesheet-detail/timesheet-detail.component.scss'],
})
export class NewTimesheetComponent implements OnInit, AfterViewInit {
  constructor(
    private apiCalls: ApiCallsService,
    private utils: Utils,
    private snackBar: MatSnackBar,
    private cdr: ChangeDetectorRef,
    private authService: AuthService,
    private fb: FormBuilder,
    private router: Router
  ) {}
  submitted = false;
  workForceList: any[];
  selectedEmpObj: any = null;
  workOrderList: any[];
  endPoints = EndPoints;
  isLoading = false;
  workOrderId: any = '';
  timeSheetData: FormGroup;
  selectedTask: any = [];
  displayHrs: any = 0;
  today = new Date();

  ngOnInit(): void {
    this.dataSource = new MatTableDataSource<any>([]);
    const auth = this.utils.getAuth();
    DrawerComponent.reinitialization();
    ToggleComponent.reinitialization();
    this.timeSheetData = this.fb.group({
      employeeId: ['', Validators.required],
      workOrderId: ['', Validators.required],
      fromDate: ['', Validators.required],
      toDate: ['', Validators.required],
      comments: [''],
      status: [''],
      newTimeSheetTaskList: [[]],
      documentList: [[]],
    });
    this.getAllWorkForceList();
    this.getAllWorkOrders();
  }

  ngAfterViewInit() {}

  displayedColumns: string[] = [
    'taskId',
    'title',
    'priority',
    'timeSpent',
    'startDate',
    'dueDate',
    'status',
    'actions',
  ];
  dataSource = new MatTableDataSource<any>();

  getAllWorkForceList() {
    this.apiCalls
      .get(this.endPoints.LIST_WORK_FORCE, {})
      .pipe(
        catchError(async (err) => {
          this.utils.showSnackBarMessage(
            this.snackBar,
            'failed to fetch the work-force'
          );
          throw err;
        })
      )
      .subscribe((response) => {
        this.workForceList = response;

        this.cdr.detectChanges();
      });
  }

  getAllWorkOrders() {
    this.apiCalls
      .get(this.endPoints.ALL_WORK_ORDERS, {})
      .pipe(
        catchError(async (err) => {
          this.utils.showSnackBarMessage(
            this.snackBar,
            'failed to fetch the work orders'
          );

          this.cdr.detectChanges();
          throw err;
        })
      )
      .subscribe((response) => {
        this.workOrderList = response;

        this.cdr.detectChanges();
      });
  }
  changeEmp(workForceId: number) {
    this.selectedEmpObj = this.workForceList.find(
      (o) => o.workForceId === workForceId
    );
    this.cdr.detectChanges();
  }
  changeWorkOrder(workOrderId: number) {
    this.workOrderId = workOrderId;
    this.selectedTask = [];
    this.dataSource = new MatTableDataSource<any>([]);
    this.displayHrs = 0.0;
    this.cdr.detectChanges();
  }
  getSelectedTaskList(selectedTask: any) {
    if (selectedTask.length) {
      let taskList = [];
      let totalHrs = 0;
      for (let index = 0; index < selectedTask.length; index++) {
        const element = selectedTask[index];
        taskList.push({
          taskId: element.taskId,
          timeSpent: 0,
          startDate: this.timeSheetData.controls['fromDate'].value,
          dueDate: this.timeSheetData.controls['toDate'].value,
          priority: element.priority,
          title: element.title,
          displayStatus: element.displayStatus,
          status: element.status,
        });
      }
      this.selectedTask = taskList;
      this.dataSource = new MatTableDataSource<any>(taskList);
      this.displayHrs = totalHrs.toFixed(1);
    }
    this.cdr.detectChanges();
  }
  changeTimeStamp() {
    let totalHrs = 0;
    for (let index = 0; index < this.selectedTask.length; index++) {
      const element = this.selectedTask[index];
      totalHrs += parseInt(element.timeSpent);
    }
    this.displayHrs = totalHrs.toFixed(1);
  }
  removeTask(index: number) {
    // this.timeSheetData.controls['newTimeSheetTaskList'].setValue([]);
    this.selectedTask.splice(index, 1);
    let totalHrs = 0;
    for (let index = 0; index < this.selectedTask.length; index++) {
      const element = this.selectedTask[index];
      totalHrs += parseInt(element.timeSpent);
    }
    this.displayHrs = totalHrs.toFixed(1);
    this.dataSource = new MatTableDataSource<any>(this.selectedTask);

    this.cdr.detectChanges();
  }

  allFiles: File[] = [];

  droppedFiles(allFiles: File[], name: string): void {
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
        const docList = this.timeSheetData.controls[name].value;
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
        this.timeSheetData.controls[name].value.push(allFiles[i]);
      }
    }
  }

  selectFile(event: any, name: string) {
    if (event.target.files.length) {
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
        const docList = this.timeSheetData.controls[name].value;
        console.log(docList);
        if (docList.length < 6) {
          if (this.utils.isFileExist(docList, file)) {
            this.utils.showSnackBarMessage(
              this.snackBar,
              'This file "' + file.name + '" already exist.'
            );
          } else {
            this.timeSheetData.controls[name].value.push(file);
          }
        } else {
          this.utils.showSnackBarMessage(
            this.snackBar,
            'Maximum 6 files can be added.'
          );
        }
      }
    }
  }

  clearFile(name: string, index: number) {
    this.timeSheetData.controls[name].value.splice(index, 1);
  }
  changeDateToUtc(dateObj: any) {
    const date = new Date(dateObj);
    const utcDate = date.toISOString();
    return utcDate;
  }
  numberOnly(event: any): boolean {
    const charCode = event.which ? event.which : event.keyCode;
    if (charCode > 31 && (charCode < 48 || charCode > 57)) {
      return false;
    }
    return true;
  }
  async save(status: string) {
    this.timeSheetData.controls['newTimeSheetTaskList'].setValue([]);
    var checkTimeSpent = this.selectedTask.filter(
      (i: any) => i.timeSpent === 0
    );
    if (checkTimeSpent.length) {
      this.utils.showSnackBarMessage(
        this.snackBar,
        'Please add time spent (hrs).'
      );
      return;
    }
    for (let index = 0; index < this.selectedTask.length; index++) {
      const element = this.selectedTask[index];
      this.timeSheetData.controls['newTimeSheetTaskList'].value.push({
        taskId: element.taskId,
        timeSpent: element.timeSpent,
        startDate: element.startDate,
        dueDate: element.dueDate,
      });
    }
    let formData: any = new Object();
    this.submitted = true;

    // stop here if form is invalid
    if (this.timeSheetData.invalid) {
      return;
    }

    this.isLoading = true;
    if (this.timeSheetData.controls['fromDate'].value) {
      this.timeSheetData.controls['fromDate'].setValue(
        this.changeDateToUtc(this.timeSheetData.controls['fromDate'].value)
      );
    }
    if (this.timeSheetData.controls['toDate'].value) {
      this.timeSheetData.controls['toDate'].setValue(
        this.changeDateToUtc(this.timeSheetData.controls['toDate'].value)
      );
    }

    for (const key of Object.keys(this.timeSheetData.value)) {
      if (key != 'documentList') {
        const value = this.timeSheetData.value[key];

        if (value) {
          formData[key] = value;
        }
      }
    }
    formData['status'] = status;
    this.apiCalls
      .post(this.getEndpoint(status), formData)
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
          const file = this.timeSheetData.get('documentList')?.value;
          if (file.length) {
            const docFormData = new FormData();
            file.forEach((fileObj: File) => {
              const blob = new Blob([fileObj], { type: fileObj.type });
              docFormData.append('documentList', blob, fileObj.name);
            });

            docFormData.append('timeSheetId', response);
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
                  this.ngOnInit();
                  this.utils.showSnackBarMessage(
                    this.snackBar,
                    'Time sheet created successfully'
                  );
                  this.router.navigate(['/timesheets']);
                }
              });
          } else {
            this.isLoading = false;
            this.ngOnInit();
            this.utils.showSnackBarMessage(
              this.snackBar,
              'Time sheet created successfully'
            );
            this.router.navigate(['/timesheets']);
          }
        }
      });
  }

  get f() {
    return this.timeSheetData.controls;
  }

  getEndpoint(status: string) {
    return status === 'Draft'
      ? this.endPoints.CREATE_TIME_SHEET_AS_DRAFT
      : this.endPoints.CREATE_TIME_SHEET;
  }
}

export interface PeriodicElement {
  taskId: number;
  title: string;
  priority: string;
  // assignTo: string;
  estimatedTime: string;
  startDate: string;
  finishDate: string;
  status: string;
}
