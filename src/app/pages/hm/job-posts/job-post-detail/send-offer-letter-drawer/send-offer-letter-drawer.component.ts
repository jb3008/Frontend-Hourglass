import { Component, Input, OnInit, ViewChild, ElementRef, ChangeDetectorRef } from '@angular/core';
import InlineEditor from '@ckeditor/ckeditor5-build-inline';
import { Utils } from 'src/app/services/utils';
import { MatSnackBar } from '@angular/material/snack-bar';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import EndPoints from 'src/app/common/endpoints';
import { ApiCallsService } from 'src/app/services/api-calls.service';
import { catchError } from 'rxjs';
import { MatDialog } from '@angular/material/dialog';

@Component({
  selector: 'app-send-offer-letter-drawer',
  templateUrl: './send-offer-letter-drawer.component.html',
})
export class SendOfferLetterDrawerComponent implements OnInit {

  @Input()jobDetails: any;
  @Input()jobSeeker: any;

  @ViewChild('cancel') cancelBtn: ElementRef;

  endPoints  = EndPoints;

  isLoading = false;
  editor = InlineEditor;
  data: any;
  jobPostData: FormGroup;
  allFiles: File[] = [];
  rate: string;
  
  constructor(private utils: Utils, private snackBar: MatSnackBar, private formBuilder: FormBuilder,
    private apiCalls: ApiCallsService, private dialog: MatDialog, private cdr: ChangeDetectorRef) {}

  ngOnInit(): void { 
    this.jobPostData = this.formBuilder.group({
      offerLetter: ['', Validators.required],
    });
  }
  
  ngOnChanges() {
    this.data  = `Dear ${this.jobSeeker?.firstName} ${this.jobSeeker?.lastName},</br></br>
    We are delighted to extend our official offer for the job ${this.jobDetails?.title} at ${this.jobDetails?.companyDetails?.title}. After thorough evaluation of your application details, we believe that you are an excellent fit for our organization. 
    </br>
    </br>
    To accept this job offer, please review  the attached employment contract carefully. If you have any questions or require clarification on any terms, please do not hesitate to reach out to our Human Resources department at <a href="mailto:${this.jobDetails?.managerDetails?.emailId}">${this.jobDetails?.managerDetails?.emailId}.</a>
    </br>
    </br>
    We look forward to welcoming you to our team and working together towards achieving our shared goals. We believe that your contributions will make a significant impact on our organization, and we are excited about the prospect of having you onboard.
    </br>
    </br>
    Once again, congratulations on your selection for this role. We eagerly anticipate your positive response.
    `;

    this.rate = this.jobDetails.jobKind == 'Hourly' ? this.jobDetails.rate : this.jobDetails.minBudget;
    debugger
  }

  selectFile(event: any, name: any){
    const file = event.target.files[0];
    if(file.type.indexOf('image') == 0){
      this.utils.showSnackBarMessage(this.snackBar, 'Please upload documents only');
    } else if (file.size > 2 * 1024 * 1024) { // check if file size is > 2 MB
      this.utils.showSnackBarMessage(this.snackBar, 'Maximum allowed file size is 2 MB. Please choose another file.');
    } else {
      this.jobPostData.controls[name].setValue(file);
      console.log(this.jobPostData.value);
    }
  }
  
  clearFileInput(element: any) {
    this.utils.clearFileInput(element);
  }

  clearFile(name: string) {
    this.jobPostData.controls[name].setValue(null);
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

  sendOfferLetter() {
    const formData = new FormData();

    if (!!!this.rate || !!!this.data || !!!this.jobPostData.valid) {
      this.utils.showSnackBarMessage(this.snackBar, 'Please enter all required data');
      return;
    }

    this.isLoading = true;
    
    formData.append('status', 'OFFER_SENT');
    formData.append('jobPostId', this.jobDetails.id);
    formData.append('jobAppId', this.jobSeeker.id);
    formData.append('offerMsg', this.data);
    formData.append('rate', this.jobDetails.jobKind == 'Hourly' ? this.rate : '0');
    formData.append('budget', this.jobDetails.jobKind == 'Fixed' ? this.rate: '0');
    formData.append('otherDocList', this.jobPostData.value['offerLetter']);

    this.apiCalls.post(this.endPoints.SEND_JOB_OFFER, formData, { "Content-Type": "multipart/form-data" })
    .pipe(catchError(async (err) => {
      this.isLoading = false;
      this.cdr.detectChanges();
      setTimeout(() => {
        throw err;  
      }, 10);
      
    }))
    .subscribe(() => {
      if (this.isLoading) { // isLoading = true indicates no error.
        this.isLoading = false;
        this.cdr.detectChanges();
        this.utils.showDialog(this.dialog, 'offer sent successfully', () => {
          //close drawer
          this.cancelBtn.nativeElement.click();
        });
      }
    });
  }
}