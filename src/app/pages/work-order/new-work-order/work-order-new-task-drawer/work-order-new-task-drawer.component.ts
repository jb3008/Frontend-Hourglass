import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import EndPoints from 'src/app/common/endpoints';
import { ApiCallsService } from 'src/app/services/api-calls.service';
import { Utils } from 'src/app/services/utils';

@Component({
  selector: 'app-work-order-new-task-drawer',
  templateUrl: './work-order-new-task-drawer.component.html',
})
export class WorkOrderNewTaskDrawerComponent implements OnInit {
  constructor(
    private fb: FormBuilder,
    private apiCalls: ApiCallsService,
    private utils: Utils,
    private snackBar: MatSnackBar,
    private dialog: MatDialog,
    private cdr: ChangeDetectorRef
  ) {}

  taskData: FormGroup;
  endpoints = EndPoints;
  isLoading = false;

  ngOnInit(): void {
    this.taskData = this.fb.group({
      title: ['', Validators.required],
      assigneeId: ['', Validators.required],
      startDate: ['', Validators.required],
      priority: ['', Validators.required],
      expectedFinishDate: ['', Validators.required],
      comments: ['', Validators.required],
      documentList: [[]],
    });
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
      if (docList.length < 6) {
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
}
