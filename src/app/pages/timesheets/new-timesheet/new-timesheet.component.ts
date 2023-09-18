import {
  AfterViewInit,
  ChangeDetectorRef,
  Component,
  OnInit,
  ViewChild,
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
import {
  Observable,
  catchError,
  map,
  retry,
  startWith,
  throwError,
} from 'rxjs';
import { tap } from 'rxjs/operators';

import {
  FormBuilder,
  FormControl,
  FormGroup,
  Validators,
} from '@angular/forms';
import { Router } from '@angular/router';
import { MatAutocompleteTrigger } from '@angular/material/autocomplete';
import { MatDialog } from '@angular/material/dialog';
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
    private router: Router,
    private dialog: MatDialog
  ) {}
  submitted = false;
  workForceList: any[];
  selectedEmpObj: any = null;
  workOrderList: any[];
  WorkForceSearchResult: Observable<any[]>;
  WorkOrderSearchResult: Observable<any[]>;
  WorkForceCntrl = new FormControl();
  WorkOrderCntrl = new FormControl();
  endPoints = EndPoints;
  isLoading = false;
  workOrderId: any = '';
  timeSheetData: FormGroup;
  selectedTask: any = [];
  selectedTaskForDrawer: any = [];
  displayHrs: any = 0;
  today = new Date();

  ngOnInit(): void {
    window.addEventListener('scroll', this.scrollEvent, true);
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
  scrollEvent = (event: any): void => {
    let element = document.querySelector('.mat-autocomplete-panel');
    if (element) {
      element.parentNode?.removeChild(element);
    }
  };
  ngAfterViewInit() {}

  getFilteredValuesForWorkForce(reset?: string) {
    if (reset) {
      this.timeSheetData.controls['employeeId'].setValue('');
    }
    const auth = this.utils.getAuth();
    if (!auth?.isAdmin && this.workForceList.length) {
      this.timeSheetData.controls['employeeId'].setValue(
        this.workForceList[0].workForceId
      );
      this.WorkForceSearchResult = this.WorkForceCntrl.valueChanges.pipe(
        startWith(''),
        map((value) => this.showSearchResult(value)),
        tap(() => this.WorkForceCntrl.setValue(this.workForceList[0]))
      );
      this.WorkForceCntrl.disable();
      this.cdr.detectChanges();
    } else {
      this.WorkForceSearchResult = this.WorkForceCntrl.valueChanges.pipe(
        startWith(''),
        map((value) => this.showSearchResult(value))
      );
    }
  }
  showSearchResult(data: any) {
    return this.workForceList.filter((obj) => {
      let fullName = `${obj.firstName} ${obj.lastName}`.toLowerCase();
      if (data && typeof data === 'object') {
        data = data.firstName + ' ' + data.lastName;
      }
      let searchData = data.toLowerCase();
      let filteredData = fullName.includes(searchData);
      return filteredData;
    });
  }
  setWorkForceValue(event: any) {
    let value = event.option.value.workForceId;
    this.timeSheetData.controls['employeeId'].setValue(value);
    this.selectedEmpObj = this.workForceList.find(
      (o) => o.workForceId === value
    );

    this.cdr.detectChanges();
  }
  displayFn(emp: any): string {
    return emp ? `${emp.firstName} ${emp.lastName}` : '';
  }

  getFilteredValuesForWorkOrder(reset?: string) {
    if (reset) {
      this.timeSheetData.controls['workOrderId'].setValue('');
    }

    this.WorkOrderSearchResult = this.WorkOrderCntrl.valueChanges.pipe(
      startWith(''),
      map((value) => this.showSearchResultForWorkOrder(value))
    );
  }
  showSearchResultForWorkOrder(data: any) {
    return this.workOrderList.filter((obj) => {
      let title = `${obj.title}`.toLowerCase();
      if (data && typeof data === 'object') {
        data = data.title;
      }
      let searchData = data.toLowerCase();
      let filteredData = title.includes(searchData);

      return filteredData;
    });
  }
  setWorkOrderValue(event: any) {
    let value = event.option.value.workOrderId;
    this.timeSheetData.controls['workOrderId'].setValue(value);
    this.workOrderId = value;
    this.selectedTask = [];
    this.dataSource = new MatTableDataSource<any>([]);
    this.displayHrs = 0.0;
    this.cdr.detectChanges();
  }
  displayFnWorkOrder(workOrder: any): string {
    return workOrder ? `${workOrder.title}` : '';
  }

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
          this.utils.showErrorDialog(this.dialog, err);
        })
      )
      .subscribe((response) => {
        const auth = this.utils.getAuth();
        this.workForceList = response.list;
        this.getFilteredValuesForWorkForce();
        this.cdr.detectChanges();
      });
  }

  getAllWorkOrders() {
    this.apiCalls
      .get(this.endPoints.ALL_WORK_ORDERS, {
        vendorId: this.utils.getAuth()?.vendorId,
      })
      .pipe(
        catchError(async (err) => {
          this.utils.showErrorDialog(this.dialog, err);
          this.cdr.detectChanges();
          throw err;
        })
      )
      .subscribe((response) => {
        this.workOrderList = response.list;
        this.getFilteredValuesForWorkOrder();
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
  getSelectedTaskList(selectedTaskFromTask: any) {
    this.selectedTaskForDrawer = [];
    // const alreadyExist = this.selectedTask.filter((r: any) =>
    //   selectedTaskFromTask.map((a: any) => a.taskId).includes(r.taskId)
    // );
    // if (alreadyExist.length) {
    //   this.utils.showSnackBarMessage(
    //     this.snackBar,
    //     `Task Id (${alreadyExist
    //       .map((a: any) => a.taskId)
    //       .join(',')}) already linked.`
    //   );
    //   return;
    // }

    if (selectedTaskFromTask.length) {
      let totalHrs = 0;
      for (let index = 0; index < selectedTaskFromTask.length; index++) {
        const element = selectedTaskFromTask[index];
        this.selectedTask.push({
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
      console.log(this.selectedTask);
      this.dataSource = new MatTableDataSource<any>(this.selectedTask);
      this.displayHrs = totalHrs.toFixed(1);
      this.cdr.detectChanges();
    }

    this.selectedTaskForDrawer = this.selectedTask;
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
    this.selectedTaskForDrawer = this.selectedTask;
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
    const alreadyExist = this.selectedTask.filter(
      (obj: any, index: number) =>
        this.selectedTask.findIndex(
          (item: any) =>
            item.startDate === obj.startDate && item.taskId === obj.taskId
        ) === index
    );

    if (alreadyExist.length !== this.selectedTask.length) {
      this.utils.showSnackBarMessage(
        this.snackBar,
        `Duplicate task linked.Please check date.`
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
          this.utils.showErrorDialog(this.dialog, err);
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
                  this.utils.showErrorDialog(this.dialog, err);
                  this.cdr.detectChanges();
                })
              )
              .subscribe(async (response) => {
                if (this.isLoading) {
                  this.isLoading = false;
                  this.ngOnInit();
                  this.utils.showSnackBarMessage(
                    this.snackBar,
                    this.getMessage(status)
                  );
                  this.router.navigate(['/timesheets']);
                }
              });
          } else {
            this.isLoading = false;
            this.ngOnInit();
            this.utils.showSnackBarMessage(
              this.snackBar,
              this.getMessage(status)
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
  getMessage(status: string) {
    return status === 'DRAFT'
      ? 'Time sheet saved as draft successfully'
      : 'Time sheet created successfully';
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
