import { ChangeDetectorRef, Component, EventEmitter, Input, OnChanges, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { catchError } from 'rxjs/internal/operators/catchError';
import EndPoints from 'src/app/common/endpoints';
import { ApiCallsService } from 'src/app/services/api-calls.service';
import { Utils } from 'src/app/services/utils';


@Component({
  selector: 'app-new-task-drawer',
  templateUrl: './new-task-drawer.component.html',
})
export class NewTaskDrawerComponent implements OnInit, OnChanges {

  constructor(private fb: FormBuilder, private apiCalls: ApiCallsService, private utils: Utils, private snackBar: MatSnackBar,
    private dialog: MatDialog, private cdr: ChangeDetectorRef) {}
  
  taskData: FormGroup;
  endpoints = EndPoints;
  isLoading = false;
  assigneeList: any[] = [];
  @Output() getList = new EventEmitter<any>;
  @Input() vendorId: any;
  @Input() taskDetails: any;

  ngOnInit(): void {
    this.taskData = this.fb.group({
      title: ['', Validators.required],
      assigneeId: ['', Validators.required],
      startDate: ['', Validators.required],
      priority: ['', Validators.required],
      expectedFinishDate: ['', Validators.required],
      comments: ['', Validators.required],
      timeSpent: ['', Validators.required],
      documentList: [[]]
    });
    
    this.getAssigneeList();
  }

  ngOnChanges(changes: any){
    if(changes?.taskDetails?.currentValue){
      this.taskDetails = changes.taskDetails.currentValue;
      this.setEditValuesOnUi();
    }
  }

  allFiles: File[] = [];

  droppedFiles(allFiles: File[]): void {
    console.log('this.allFiles')
    const filesAmount = allFiles.length;
    for (let i = 0; i < filesAmount; i++) {
      const file = allFiles[i];
      this.allFiles.push(file);
    }
    console.log(this.allFiles)
  }

  getAssigneeList(){
    const queryParam = {
      vendorId : this.vendorId
    }
    this.apiCalls.get(this.endpoints.GET_VENDOR_STAFF_DETAILS, queryParam)
      .pipe(
        catchError(async (err) => {
          this.utils.showSnackBarMessage(this.snackBar, 'failed to fetch the assignee list');
          throw err;
        })
      )
      .subscribe((response) => {
        this.assigneeList = response;
      });
  }

  selectFile(event: any){
    const file = event.target.files[0];
    if(file.type.indexOf('image') == 0){
      this.utils.showSnackBarMessage(this.snackBar, 'Please upload documents only');
    } else if (file.size > 2 * 1024 * 1024) { // check if file size is > 2 MB
      this.utils.showSnackBarMessage(this.snackBar, 'Maximum allowed file size is 2 MB. Please choose another file.');
    } else {
      const docList = this.taskData.controls['documentList']?.value;
        if (docList.length < 6) {
          if (this.utils.isFileExist(docList, file)) {
            this.utils.showSnackBarMessage(this.snackBar, 'This file "' + file.name + '" already exist.');
          } else {
            this.taskData.controls['documentList'].value.push(file);
          }
        } else {
          this.utils.showSnackBarMessage(this.snackBar, 'Maximum 6 files can be added.');
        }
    }
  }

  clearFile(index: number) {
    this.taskData.controls['documentList'].value.splice(index, 1);
  }

  clearFileInput(element: any) {
    this.utils.clearFileInput(element);
  }

  setEditValuesOnUi(){
    this.taskData.patchValue({
      title: this.taskDetails.title,
      assigneeId: this.taskDetails.assigneeId,
      priority: this.taskDetails.priority,
      startDate: this.taskDetails.startDate,
      expectedFinishDate: this.taskDetails.finishDate,
      comments: this.taskDetails.comments,
      timeSpent: this.taskDetails.timeSpent
    })
  }

  submitTask(){
    this.isLoading = true;
    const formData = new FormData();
    if(this.taskData.valid){
      this.taskData.controls['startDate'].setValue(this.changeDateToUtc(this.taskData.controls['startDate'].value))
      this.taskData.controls['expectedFinishDate'].setValue(this.changeDateToUtc(this.taskData.controls['expectedFinishDate'].value))
      this.isLoading = true;
      for (const key of Object.keys(this.taskData.value) ) {
        if(key !== 'documentList'){
          const value = this.taskData.value[key];
          formData.append(key, value);
        }else{
          const file = this.taskData.value['documentList'];
          if(file.length != 0){
            file.forEach((fileObj: File) => {
              const blob = new Blob([fileObj], { type: fileObj.type });
              formData.append(key, blob, fileObj.name);
            })
          }
        }
      }
      if(this.taskDetails){
        formData.append('id', this.taskDetails.taskId);
      }
      formData.append('status', 'ACTIVE');

      this.apiCalls.post(this.taskDetails == '' ? this.endpoints.CREATE_TASK: this.endpoints.UPDATE_TASK,formData)
      .pipe(catchError(async (err) => {
        this.isLoading = false;
        setTimeout(() => {
          throw err;  
        }, 10);
        this.cdr.detectChanges()
      }))
      .subscribe(response => {
        if (this.isLoading) { // isLoading = true indicates no error.
          this.openSuccessPopup();
        }
      })
    }else{
      this.utils.showSnackBarMessage(this.snackBar, 'Please enter all required data');
    }
  }

  openSuccessPopup(){
    let msg = 'Your Task is successfully created';
    this.utils.showDialog(this.dialog, msg, () => {
      this.isLoading = false;
      let closeBtn = document.getElementById('kt_new_task_close');
      closeBtn?.click();
      this.getList.emit();
      this.cdr.detectChanges();
    });
  }

  changeDateToUtc(dateObj: any){
    const date = new Date(dateObj);
    const utcDate = date.toISOString()
    return utcDate;
  }
}


