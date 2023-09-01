import {
  ChangeDetectorRef,
  AfterViewInit,
  Component,
  OnInit,
  ViewChild,
} from '@angular/core';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { DrawerComponent } from 'src/app/_metronic/kt/components';

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
    private router: Router,
    private dialog: MatDialog,
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
  selectedWorkOrder: any;
  today: any = new Date();
  WorkOrderSearchResult: Observable<any[]>;
  WorkOrderCntrl = new FormControl();

  @ViewChild('WorkOrderSearch', { read: MatAutocompleteTrigger })
  autoComplete: MatAutocompleteTrigger;
  ngOnInit(): void {
    // DrawerComponent.reinitialization();
    window.addEventListener('scroll', this.scrollEvent, true);
    this.invoiceData = this.fb.group({
      workOrderId: ['', Validators.required],
      paymentTerms: [{ value: '', disabled: true }],
      invoiceNumber: ['', Validators.required],
      invoiceDate: ['', Validators.required],
      status: ['PENDING', Validators.required],
      currency: ['', Validators.required],
      comments: [''],
      timeSheetList: [[]],
      documentList: [[]],
      vendorId: [''],
      vendorAddress: [''],
      companyCode: [''],
      companyAddress: [''],
      subTotalAmount: [0],
      taxPercentage: [0, [Validators.max(100), Validators.min(0)]],
      totalAmount: [0],
    });
    this.getAllPaymentTerms();
    this.getAllWorkOrders();
  }

  scrollEvent = (event: any): void => {
    // let element = document.querySelector('.mat-autocomplete-panel');
    // if (element) {
    //   // element.parentNode?.removeChild(element);
    // }

    if (this.autoComplete.panelOpen)
      // this.autoComplete.closePanel();
      this.autoComplete.updatePosition();
  };

  getFilteredValuesForWorkOrder(reset?: string) {
    if (reset) {
      this.invoiceData.controls['workOrderId'].setValue('');
      this.invoiceData.controls['paymentTerms'].setValue('');
      this.invoiceData.controls['currency'].setValue('');
      this.invoiceData.controls['vendorId'].setValue('');
      this.invoiceData.controls['vendorAddress'].setValue('');
      this.invoiceData.controls['companyCode'].setValue('');
      this.invoiceData.controls['companyAddress'].setValue('');

      this.invoiceData.controls['taxPercentage'].setValue(0);
      this.invoiceData.controls['subTotalAmount'].setValue(0);
      this.invoiceData.controls['totalAmount'].setValue(0);
      this.selectedTask = [];
      this.dataSource = new MatTableDataSource<any>([]);
      this.selectedWorkOrder = [];
      this.cdr.detectChanges();
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
    this.invoiceData.controls['workOrderId'].setValue(value);
    this.workOrderId = value;
    const workOrder: any = this.workOrderList.find(
      (r: any) => r.workOrderId === value
    );

    const paymentTerms = this.paymentTerms.find(
      (r: any) => r.code == workOrder.paymentTerm
    );
    this.invoiceData.controls['paymentTerms'].setValue(
      `(${workOrder.payRate}) ` + paymentTerms?.name
    );
    this.invoiceData.controls['currency'].setValue(workOrder.rateCurrency);
    this.invoiceData.controls['vendorId'].setValue(
      workOrder?.vendorDetails?.vendorId
    );
    this.invoiceData.controls['vendorAddress'].setValue(
      workOrder?.vendorDetails?.address
    );
    this.invoiceData.controls['companyCode'].setValue(
      workOrder?.companyDetails?.companyCode
    );
    this.invoiceData.controls['companyAddress'].setValue(
      workOrder?.companyDetails?.address
    );

    this.invoiceData.controls['taxPercentage'].setValue(0);
    this.invoiceData.controls['subTotalAmount'].setValue(0);
    this.invoiceData.controls['totalAmount'].setValue(0);
    this.selectedTask = [];
    this.dataSource = new MatTableDataSource<any>([]);
    this.selectedWorkOrder = workOrder;
    this.cdr.detectChanges();
  }
  displayFnWorkOrder(workOrder: any): string {
    return workOrder ? `${workOrder.title}` : '';
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
          this.utils.showErrorDialog(this.dialog, err);

          this.cdr.detectChanges();
          throw err;
        })
      )
      .subscribe((response) => {
        this.workOrderList = response;
        this.getFilteredValuesForWorkOrder();
        this.cdr.detectChanges();
      });
  }

  getAllPaymentTerms() {
    this.apiCalls
      .get(this.endPoints.GET_PAYMENT_TERM, {})
      .pipe(
        catchError(async (err) => {
          this.utils.showErrorDialog(this.dialog, err);

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
    console.log(paymentTerms, workOrder.payRate);
    this.invoiceData.controls['paymentTerms'].setValue(
      `(${workOrder.payRate}) ` + paymentTerms?.name
    );
    this.invoiceData.controls['currency'].setValue(workOrder.rateCurrency);
    this.invoiceData.controls['vendorId'].setValue(
      workOrder?.vendorDetails?.vendorId
    );
    this.invoiceData.controls['vendorAddress'].setValue(
      workOrder?.vendorDetails?.address
    );
    this.invoiceData.controls['companyCode'].setValue(
      workOrder?.companyDetails?.companyCode
    );
    this.invoiceData.controls['companyAddress'].setValue(
      workOrder?.companyDetails?.address
    );

    this.invoiceData.controls['taxPercentage'].setValue(0);
    this.invoiceData.controls['subTotalAmount'].setValue(0);
    this.invoiceData.controls['totalAmount'].setValue(0);
    this.selectedTask = [];
    this.dataSource = new MatTableDataSource<any>([]);
    this.selectedWorkOrder = workOrder;
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
      const alreadyExist = this.selectedTask.filter((r: any) =>
        selectedTimeSheet.map((a: any) => a.timeSheetId).includes(r.timeSheetId)
      );
      if (alreadyExist.length) {
        this.utils.showSnackBarMessage(
          this.snackBar,
          `Timesheet Id (${alreadyExist
            .map((a: any) => a.timeSheetId)
            .join(',')}) already linked.`
        );
        return;
      }
      let subTotal = 0;
      for (let index = 0; index < selectedTimeSheet.length; index++) {
        const element = selectedTimeSheet[index];
        element.timeSpent = element.timeSpent ? parseInt(element.timeSpent) : 0;
        const rate = this.selectedWorkOrder.rate
          ? this.selectedWorkOrder.rate
          : 0;
        this.selectedTask.push({
          timeSheetId: element.timeSheetId,
          timeSpent: element.timeSpent,
          unitPrice: parseFloat(rate),
          amount:
            this.selectedWorkOrder.kind?.toLowerCase() === 'hourly'
              ? element.timeSpent * rate
              : rate,
        });
      }
      for (let index = 0; index < this.selectedTask.length; index++) {
        const element = this.selectedTask[index];
        const rate = this.selectedWorkOrder.rate
          ? this.selectedWorkOrder.rate
          : 0;
        if (this.selectedWorkOrder.kind?.toLowerCase() === 'hourly') {
          subTotal += element.timeSpent * rate;
        } else {
          subTotal += rate;
        }
      }
      this.invoiceData.controls['subTotalAmount'].setValue(subTotal);
      const totalTax = this.percentage(
        parseInt(this.invoiceData.controls['taxPercentage'].value),
        subTotal
      );

      this.invoiceData.controls['totalAmount'].setValue(
        parseFloat(totalTax) + subTotal
      );

      this.dataSource = new MatTableDataSource<any>(this.selectedTask);
    }
    this.cdr.detectChanges();
  }
  onTaxChange(): void {
    let subTotal = 0;
    if (this.invoiceData.controls['taxPercentage'].value) {
      for (let index = 0; index < this.selectedTask.length; index++) {
        const element = this.selectedTask[index];
        element.timeSpent = element.timeSpent ? parseInt(element.timeSpent) : 0;
        const rate = this.selectedWorkOrder.rate
          ? this.selectedWorkOrder.rate
          : 0;

        subTotal =
          this.selectedWorkOrder.kind?.toLowerCase() === 'hourly'
            ? element.timeSpent * rate
            : rate;
      }
      this.invoiceData.controls['subTotalAmount'].setValue(subTotal);
      const totalTax = this.percentage(
        parseInt(this.invoiceData.controls['taxPercentage'].value),
        subTotal
      );

      this.invoiceData.controls['totalAmount'].setValue(
        parseFloat(totalTax) + subTotal
      );
    } else {
      for (let index = 0; index < this.selectedTask.length; index++) {
        const element = this.selectedTask[index];
        element.timeSpent = element.timeSpent ? parseInt(element.timeSpent) : 0;
        const rate = this.selectedWorkOrder.rate
          ? this.selectedWorkOrder.rate
          : 0;

        subTotal =
          this.selectedWorkOrder.kind?.toLowerCase() === 'hourly'
            ? element.timeSpent * rate
            : rate;
      }
      this.invoiceData.controls['taxPercentage'].setValue(0);
      this.invoiceData.controls['subTotalAmount'].setValue(subTotal);
      this.invoiceData.controls['totalAmount'].setValue(subTotal);
    }
  }
  percentage(percent: number, total: number) {
    return ((percent / 100) * total).toFixed(2);
  }
  changeDateToUtc(dateObj: any) {
    const date = new Date(dateObj);
    const utcDate = date.toISOString();
    return utcDate;
  }

  async save() {
    this.invoiceData.controls['timeSheetList'].setValue([]);
    for (let index = 0; index < this.selectedTask.length; index++) {
      const element = this.selectedTask[index];
      this.invoiceData.controls['timeSheetList'].value.push({
        timeSheetId: element.timeSheetId,
        hours: element.timeSpent,
        rate: parseFloat(element.unitPrice),
        amount: parseFloat(element.amount),
      });
    }
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

    this.apiCalls
      .post(this.endPoints.CREATE_INVOICE, formData)
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
          const file = this.invoiceData.get('documentList')?.value;
          if (file.length) {
            const docFormData = new FormData();
            file.forEach((fileObj: File) => {
              const blob = new Blob([fileObj], { type: fileObj.type });
              docFormData.append('documentList', blob, fileObj.name);
            });

            docFormData.append('invoiceId', response.InvoiceId);
            this.apiCalls
              .post(this.endPoints.UPLOAD_INVOICE_DOCUMENT, docFormData)
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
                    'Invoice created successfully'
                  );
                  this.router.navigate(['/invoices']);
                }
              });
          } else {
            this.isLoading = false;
            this.ngOnInit();
            this.utils.showSnackBarMessage(
              this.snackBar,
              'Invoice created successfully'
            );
            this.router.navigate(['/invoices']);
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
