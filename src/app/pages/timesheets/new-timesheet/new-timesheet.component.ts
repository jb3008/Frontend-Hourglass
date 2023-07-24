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
    private fb: FormBuilder
  ) {}
  workForceList: any[];
  selectedEmpObj: any = null;
  workOrderList: any[];
  endPoints = EndPoints;
  isLoading = false;
  workOrderId: any = '';
  timeSheetData: FormGroup;
  selectedTask: any;
  displayHrs: any = 0;
  ngOnInit(): void {
    this.dataSource = new MatTableDataSource<any>([]);
    const auth = this.authService.getAuthFromLocalStorage();
    DrawerComponent.reinitialization();
    ToggleComponent.reinitialization();
    this.timeSheetData = this.fb.group({
      employeeId: ['', Validators.required],
      workOrderId: ['', Validators.required],
      fromDate: ['', Validators.required],
      toDate: ['', Validators.required],
      comments: [''],
      totalTimeSpent: ['0'],
      vendorId: [auth?.vendorId, Validators.required],
      status: [''],
      taskList: [[]],
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
    'finishDate',
    'status',
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
    this.cdr.detectChanges();
  }
  getSelectedTaskList(selectedTask: any) {
    if (selectedTask.length) {
      this.selectedTask = selectedTask;
      this.dataSource = new MatTableDataSource<any>(selectedTask);
      let totalHrs = 0;
      for (let index = 0; index < selectedTask.length; index++) {
        const element = selectedTask[index];

        totalHrs += parseInt(element.timeSpent);
        this.timeSheetData.controls['taskList'].value.push(element.taskId);
      }
      this.displayHrs = totalHrs.toFixed(1);
      this.timeSheetData.controls['totalTimeSpent'].setValue(totalHrs);
    }
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

  async save() {
    const formData = new FormData();

    if (this.timeSheetData.valid) {
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
            formData.append(key, value);
          }
        }
      }
      const file = this.timeSheetData.get('documentList')?.value;
      if (file.length != 0) {
        file.forEach((fileObj: File) => {
          const blob = new Blob([fileObj], { type: fileObj.type });
          formData.append('documentList', blob, fileObj.name);
        });
      }

      this.apiCalls
        .post(this.endPoints.CREATE_TIME_SHEET, formData)
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
          this.ngOnInit();
          this.utils.showSnackBarMessage(
            this.snackBar,
            'Timesheet created successfully'
          );
        });
    } else {
      const invalid = [];
      const controls = this.timeSheetData.controls;
      for (const name in controls) {
        if (controls[name].invalid) {
          invalid.push(name);
        }
      }
      console.log(invalid.length ? invalid : []);
      this.utils.showSnackBarMessage(
        this.snackBar,
        'Please enter all required data'
      );
      return false;
    }
  }
}

export interface PeriodicElement {
  taskId: number;
  title: string;
  priority: string;
  // assignTo: string;
  timeSpent: string;
  startDate: string;
  finishDate: string;
  status: string;
}
