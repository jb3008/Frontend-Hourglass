import { ChangeDetectorRef, Component, OnChanges, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { ActivatedRoute, Router } from '@angular/router';
import { catchError } from 'rxjs/internal/operators/catchError';
import { DialogComponent } from 'src/app/common/dialog/dialog.component';
import EndPoints from 'src/app/common/endpoints';
import { ApiCallsService } from 'src/app/services/api-calls.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Utils } from  'src/app/services/utils';
import { find } from 'lodash';

@Component({
  selector: 'app-job-seeker',
  templateUrl: './job-seeker.component.html',
  styleUrls: ['./job-seeker.component.scss']
})
export class JobSeekerComponent implements OnInit {

  constructor(private fb: FormBuilder, private router: Router,private dialog: MatDialog, 
    private apiCalls: ApiCallsService, private route: ActivatedRoute, private cdr: ChangeDetectorRef,
    private snackBar: MatSnackBar, private utils: Utils) { }

  jobId: string;
  applyJobData: FormGroup;
  loading = false;
  endPoints = EndPoints;
  dialogRef: MatDialogRef<DialogComponent>;
  
  allFiles: File[] = [];
  jobDetails: any;
  staffDetails: any;
  seekerId: string;

  agreeTerms = false;
  parentTab: string = null!;

  ngOnInit(): void {
    this.route.queryParams.subscribe(param => {
      this.jobId = param['jobId'];
      this.parentTab = param['tab'];
    });

    this.applyJobData = this.fb.group({
      workerId: ['', Validators.required],
      workExpYears: ['', Validators.required],
      workExpMonths: ['', Validators.required],
      availableDate: ['', Validators.required],
      workRate: ['', Validators.required],
      // workRateCurrency: [''],
      otherJobSummit: ['', Validators.required],
      displayWorkforce: ['', Validators.required],
      comment: ['', Validators.required],
      resumeDoc: [''],
      profilePictureDoc: [''],
      otherDocList: [[]],
      agreeTerms: [false, Validators.required]
    });

    this.getJobDetails();
    this.getVendorStaffDetails();
  }

  getJobDetails(){
    this.loading = true;
    let queryParam = {
      id: this.jobId
    };

    this.apiCalls.get(this.endPoints.GET_JOB_DETAILS, queryParam)
      .pipe(catchError(async (error) => {
        this.loading = false;
        this.cdr.detectChanges();
        console.log(error);
        throw error;
      }))
      .subscribe((response) => {
        this.loading = false;
        this.jobDetails = response;
        this.cdr.detectChanges();
      });
  }

  getVendorStaffDetails() {
    this.loading = true;
    let queryParam = {
      vendorId: this.utils.getVendorId()
    };

    this.apiCalls.get(this.endPoints.GET_VENDOR_STAFF_DETAILS, queryParam)
      .pipe(catchError(async (error) => {
        this.loading = false;
        this.cdr.detectChanges();
        console.log(error);
        throw error;
      }))
      .subscribe((response) => {
        this.loading = false;
        this.staffDetails = response;
        this.cdr.detectChanges();
      });
  }

  droppedFiles(allFiles: File[]): void {
    console.log('this.allFiles')
    const filesAmount = allFiles.length;
    for (let i = 0; i < filesAmount; i++) {
      const file = allFiles[i];
      this.allFiles.push(file);
    }
    console.log(this.allFiles)
  }

  onReady(eventData:any) {
    eventData.plugins.get('FileRepository').createUploadAdapter = function(loader:any) {
      console.log('loader : ', loader)
      console.log(btoa(loader.file));
      // return new UploadAdapter(loader);
    };
  }

  selectFile(event: any, name: any){
    if(event.target.files[0].type.indexOf('image') == 0 && name != 'profilePictureDoc'){
      this.utils.showSnackBarMessage(this.snackBar, 'Please upload documents only');
    }else{
      if (name == 'otherDocList'){
        this.applyJobData.controls[name].value.push(event.target.files[0]);
      } else {
        this.applyJobData.controls[name].setValue(event.target.files[0]);
      }
    }
  }

  clearFileOther(name: string, index: number) {
    this.applyJobData.controls[name].value.splice(index, 1);
  }

  goBackToDetails(){
    this.router.navigate(['/job-posts/details'], { queryParams: { jobId: this.jobId, tab: this.parentTab}});
  }

  submitApplication(){
    const formData = new FormData();
    if(this.applyJobData.valid && this.applyJobData.controls['agreeTerms'].value){
      this.loading = true;
      this.applyJobData.removeControl('agreeTerms');
      this.applyJobData.controls['availableDate'].setValue(this.utils.changeDateToUtc(this.applyJobData.controls['availableDate'].value));
      let totalMonths = (Number(this.applyJobData.controls['workExpYears'].value) * 12) + Number(this.applyJobData.controls['workExpMonths'].value);
      this.applyJobData.controls['workExpMonths'].setValue(totalMonths);
      this.applyJobData.removeControl('workExpYears');

      for (const key of Object.keys(this.applyJobData.value) ) {
        if(key !== 'resumeDoc' && key != 'profilePictureDoc' && key !== 'otherDocList'){
          const value = this.applyJobData.value[key];
          formData.append(key, value);
        }else{
          if(key == 'otherDocList'){
            const file = this.applyJobData.get(key)?.value;
            if(file.length != 0){
              file.forEach((fileObj: File) => {
                const blob = new Blob([fileObj], { type: fileObj.type });
                formData.append(key, blob, fileObj.name);
              })
            }
          }else{
            const file = this.applyJobData.get(key)?.value;
            const blob = new Blob([file], { type: file.type });
            formData.append(key, blob, file.name);
          }
        }
      }

      const workerId = formData.get('workerId');
      formData.append('status', 'ACTIVE');
      formData.append('jobPostId', this.jobId);
      formData.append('vendorId', this.utils.getVendorId()!);
      formData.append('firstName', this.getWorkerDetails(workerId, 'firstName'));
      formData.append('lastName', this.getWorkerDetails(workerId, 'lastName'));
      formData.append('workRateCurrency', this.jobDetails.currency);
      

      this.apiCalls.post(this.endPoints.APPLY_JOB_VENDOR, formData)
        .pipe(catchError(async (err) => {
          this.loading = false;
          this.cdr.detectChanges();
          alert(err.error.msg);
          throw err;
        }))
        .subscribe(response => {
          this.openSuccessPopup();
        })
    } else {
      this.utils.showSnackBarMessage(this.snackBar, 'Please enter all required data');
    }
  }

  getWorkerDetails(workerId: any, key: string) {
    const worker = find(this.staffDetails, {'userId': workerId});

    if (!!!worker) {
      return worker;
    }

    return worker[key];
  }

  cancelApplication() {
    this.navigateBack();
  }

  openSuccessPopup(){
     this.utils.showDialog('You have successfully applied for the job', (data:any) => {
      this.loading = false;
      this.cdr.detectChanges();
      this.navigateBack();
    });
  }

  navigateBack() {
    this.router.navigate(['/job-posts'])
  }
}
