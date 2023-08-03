import {
  ChangeDetectorRef,
  AfterViewInit,
  Component,
  OnInit,
} from '@angular/core';
import { NgbAccordionModule } from '@ng-bootstrap/ng-bootstrap';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { DrawerComponent } from 'src/app/_metronic/kt/components';

import EndPoints from 'src/app/common/endpoints';
import { ApiCallsService } from 'src/app/services/api-calls.service';
import { Utils } from 'src/app/services/utils';
import { AuthService } from 'src/app/modules/auth';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Observable, catchError, throwError } from 'rxjs';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
@Component({
  selector: 'app-new-invoice',
  templateUrl: './new-invoice.component.html',
  styleUrls: ['./new-invoice.component.scss'],
})
export class NewInvoiceComponent implements OnInit {
  constructor(
    private apiCalls: ApiCallsService,
    private utils: Utils,
    private snackBar: MatSnackBar,
    private cdr: ChangeDetectorRef,
    private authService: AuthService,
    private fb: FormBuilder,
    private router: Router
  ) {}
  submitted: boolean = false;
  workOrderList: any[];
  endPoints = EndPoints;
  workOrderId: any = '';
  workForceList: any[];
  invoiceData: FormGroup;
  selectedTask: any = [];
  isLoading = false;

  paymentTerms: any = [];
  ngOnInit(): void {
    // DrawerComponent.reinitialization();
    this.invoiceData = this.fb.group({
      workOrderId: ['', Validators.required],
      paymentTerms: [{ value: '', disabled: true }],
      invoiceNumber: ['', Validators.required],
      invoiceDate: ['', Validators.required],
      invoiceAmount: [0, Validators.required],
      workRateCurrency: ['', Validators.required],
      comments: [''],
      newInvoiceTimeSheetList: [[]],
      documentList: [[]],
      rate: [0],
      taxAmount: [0],
    });
    this.getAllPaymentTerms();
    this.getAllWorkOrders();
  }

  get f() {
    return this.invoiceData.controls;
  }

  toNumber(num: number) {
    return (Math.round(num * 100) / 100).toFixed(2);
  }
  changeNum(number: any) {
    return parseInt(number);
  }
  ngAfterViewInit() {
    DrawerComponent.reinitialization();
  }

  displayedColumns: string[] = [
    'timeSheetId',
    'quantity',
    'unitPrice',
    'amount',
  ];
  dataSource = new MatTableDataSource<PeriodicElement>([]);

  onReady(eventData: any) {
    eventData.plugins.get('FileRepository').createUploadAdapter = function (
      loader: any
    ) {
      console.log('loader : ', loader);
      console.log(btoa(loader.file));
      // return new UploadAdapter(loader);
    };
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

  getAllPaymentTerms() {
    this.apiCalls
      .get(this.endPoints.GET_PAYMENT_TERM, {})
      .pipe(
        catchError(async (err) => {
          this.utils.showSnackBarMessage(
            this.snackBar,
            'failed to fetch the payment terms'
          );

          this.cdr.detectChanges();
          throw err;
        })
      )
      .subscribe((response) => {
        this.paymentTerms = response;

        this.cdr.detectChanges();
      });
  }

  changeWorkOrder(workOrderId: number) {
    this.workOrderId = workOrderId;
    const workOrder: any = this.workOrderList.find(
      (r: any) => r.workOrderId === workOrderId
    );
    const paymentTerms = this.paymentTerms.find(
      (r: any) => r.id == workOrder.payRate
    );
    this.invoiceData.controls['paymentTerms'].setValue(
      `(${workOrder.payRate}) ` + paymentTerms?.name
    );
    this.invoiceData.controls['workRateCurrency'].setValue(
      workOrder.rateCurrency
    );
    this.invoiceData.controls['rate'].setValue(
      workOrder.rate ? workOrder.rate : 0
    );
    this.cdr.detectChanges();
  }

  allFiles: File[] = [];

  droppedFiles(allFiles: File[], name: string): void {
    console.log('this.allFiles', allFiles);
    console.log(this.invoiceData.controls[name].value);
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
        const docList = this.invoiceData.controls[name].value;
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
        this.invoiceData.controls[name].value.push(allFiles[i]);
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
      const docList = this.invoiceData.controls[name].value;
      if (docList.length < 6) {
        if (this.utils.isFileExist(docList, file)) {
          this.utils.showSnackBarMessage(
            this.snackBar,
            'This file "' + file.name + '" already exist.'
          );
        } else {
          this.invoiceData.controls[name].value.push(file);
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
    this.invoiceData.controls[name].value.splice(index, 1);
  }

  getSelectedTimesheetList(selectedTimeSheet: any) {
    if (selectedTimeSheet.length) {
      let timeSheetList = [];
      let invoiceAmount = 0;
      for (let index = 0; index < selectedTimeSheet.length; index++) {
        const element = selectedTimeSheet[index];
        element.timeSpent = element.timeSpent ? parseInt(element.timeSpent) : 0;
        const rate = this.invoiceData.controls['rate'].value
          ? this.invoiceData.controls['rate'].value
          : 0;
        timeSheetList.push({
          timeSheetId: element.timeSheetId,
          timeSpent: element.timeSpent,
          unitPrice: parseFloat(this.invoiceData.controls['rate'].value),
          amount: element.timeSpent * rate,
        });
        invoiceAmount += element.timeSpent * rate;
      }
      this.invoiceData.controls['invoiceAmount'].setValue(invoiceAmount);
      this.selectedTask = timeSheetList;
      this.dataSource = new MatTableDataSource<any>(timeSheetList);
    }
    this.cdr.detectChanges();
  }

  changeDateToUtc(dateObj: any) {
    const date = new Date(dateObj);
    const utcDate = date.toISOString();
    return utcDate;
  }

  async save() {
    // this.invoiceData.controls['newInvoiceTimeSheetList'].setValue([]);
    // for (let index = 0; index < this.selectedTask.length; index++) {
    //   const element = this.selectedTask[index];
    //   this.invoiceData.controls['newInvoiceTimeSheetList'].value.push({
    //     taskId: element.taskId,
    //     timeSpent: element.timeSpent,
    //     startDate: element.startDate,
    //     dueDate: element.dueDate,
    //   });
    // }
    let formData: any = new Object();
    this.submitted = true;

    // stop here if form is invalid
    if (this.invoiceData.invalid) {
      return;
    }

    this.isLoading = true;
    if (this.invoiceData.controls['invoiceDate'].value) {
      this.invoiceData.controls['invoiceDate'].setValue(
        this.changeDateToUtc(this.invoiceData.controls['invoiceDate'].value)
      );
    }

    for (const key of Object.keys(this.invoiceData.value)) {
      if (key != 'documentList') {
        const value = this.invoiceData.value[key];

        if (value) {
          formData[key] = value;
        }
      }
    }
    formData['status'] = status;
    this.apiCalls
      .post(this.endPoints.CREATE_INVOICE, formData)
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
          const file = this.invoiceData.get('documentList')?.value;
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
}

export interface PeriodicElement {
  taskId: number;
  taskName: string;
  priority: string;
  // assignTo: string;
  timeSpent: string;
  eta: string;
  lastUpdate: string;
  status: string;
}

const ELEMENT_DATA: PeriodicElement[] = [
  {
    taskId: 8865,
    taskName: 'Some task name that has lengthy characters',
    priority: 'Low',
    timeSpent: '38 hrs',
    eta: '28/5/2023',
    lastUpdate: '28/5/2023',
    status: 'In-progress',
  },
];
