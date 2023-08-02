import { ChangeDetectorRef, Component, Input, OnChanges, OnInit, SimpleChanges, ViewChild } from '@angular/core';
import { catchError } from 'rxjs/internal/operators/catchError';
import { ModalConfig, ModalComponent } from 'src/app/_metronic/partials';
import EndPoints from 'src/app/common/endpoints';
import { ApiCallsService } from 'src/app/services/api-calls.service';
import { Utils } from  'src/app/services/utils';

@Component({
  selector: 'app-view-offer-letter-drawer',
  templateUrl: './view-offer-letter-drawer.component.html',
})
export class ViewOfferLetterDrawerComponent implements OnInit, OnChanges {

  constructor(private apiCalls: ApiCallsService, private cdr: ChangeDetectorRef, private utils: Utils) {}

  @Input() offerDetails: any[] = [];
  @Input() rate: any;
  @Input() currency: any;
  loading = false;

  modalConfig: ModalConfig = {
    modalTitle: 'View Document',
    dismissButtonLabel: 'Cancel',
    closeButtonLabel: 'Save',
    hideFooter: this.hideFooter,
  };
  @ViewChild('modal') private modalComponent: ModalComponent;

  documentsList: any[] = [];
  endPoints = EndPoints;

  ngOnInit(): void {
    this.getOfferDocuments();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if(changes?.offerDetails?.currentValue.length > 0){
      this.offerDetails = changes.offerDetails.currentValue;
    }
    if(changes?.rate?.currentValue){
      this.rate = changes.rate.currentValue;
    }
    if(changes?.currency?.currentValue){
      this.currency = changes.currency.currentValue;
    }
  }

  async hideFooter(): Promise<boolean> {
    return true;
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

  getAttachment(id: string, name: string){
    this.loading = true;
    let queryParam = {
      documentId: id,
    };
    this.apiCalls
      .getDocument(this.endPoints.GET_ATTACHMENT, queryParam)
      .pipe(
        catchError(async (error) => {
          this.loading = false;
          this.cdr.detectChanges();
          throw error;
        })
      )
      .subscribe((response) => {
        const url = window.URL.createObjectURL(response);
        const anchor = document.createElement('a');
        anchor.href = url;
        anchor.download = name;
        anchor.click();
        window.URL.revokeObjectURL(url);
        this.loading = false;
        this.cdr.detectChanges();
      });
  }

  pdfSrc = '';
  async openModal(documentId: any) {
    let queryParam = {
      documentId: documentId,
    };
    this.apiCalls
      .getDocument(this.endPoints.GET_ATTACHMENT, queryParam)
      .pipe(
        catchError(async (error) => {
          this.cdr.detectChanges();
          throw error;
        })
      )
      .subscribe(async (response) => {
        const src = window.URL.createObjectURL(response);
        this.pdfSrc = src;
        this.cdr.detectChanges();
        return await this.modalComponent.open();
      });
  }
  
}


