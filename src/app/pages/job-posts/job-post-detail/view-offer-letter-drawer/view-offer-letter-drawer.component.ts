import { ChangeDetectorRef, Component, Input, OnInit } from '@angular/core';
import { catchError } from 'rxjs/internal/operators/catchError';
import EndPoints from 'src/app/common/endpoints';
import { ApiCallsService } from 'src/app/services/api-calls.service';
import { Utils } from  'src/app/services/utils';

@Component({
  selector: 'app-view-offer-letter-drawer',
  templateUrl: './view-offer-letter-drawer.component.html',
})
export class ViewOfferLetterDrawerComponent implements OnInit {

  constructor(private apiCalls: ApiCallsService, private cdr: ChangeDetectorRef, private utils: Utils) {}

  @Input() offerDetails: any[] = [];
  @Input() rate: any;
  @Input() currency: any;

  documentsList: any[] = [];
  endPoints = EndPoints;

  ngOnInit(): void {
    this.getOfferDocuments();
  }

  getOfferDocuments(){
    let queryParam = {
      id : this.offerDetails[0]?.id,
      attachmentType : 'JOB_OFFER'
    }
    this.apiCalls.get(this.endPoints.GET_DOCUMENTS, queryParam)
      .pipe(catchError(async (error) => {
        this.cdr.detectChanges();
        throw error;
      }))
      .subscribe((response) => {
        this.documentsList = response;
        this.cdr.detectChanges();
      })
  }

  selectFile(event: any, name: any){
    // if(event.target.files[0].type.indexOf('image') == 0){
    //   alert('Please upload documents only');
    // }else{
    //   if(name == 'otherDocList'){
    //     this.jobPostData.controls[name].value.push(event.target.files[0]);
    //   }else{
    //     this.jobPostData.controls[name].setValue(event.target.files[0]);
    //   }
    //   console.log(this.jobPostData.value);
      
    // }
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

  getDocIcon(fileName: string) {
    return  this.utils.getDocIcon(fileName);
  }
}


