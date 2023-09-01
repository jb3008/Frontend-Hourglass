import { ChangeDetectorRef, Component, Input, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import InlineEditor from '@ckeditor/ckeditor5-build-inline';
import { catchError } from 'rxjs/internal/operators/catchError';
import EndPoints from 'src/app/common/endpoints';
import { ApiCallsService } from 'src/app/services/api-calls.service';
import { Utils } from 'src/app/services/utils';

@Component({
  selector: 'app-logs-drawer',
  templateUrl: './logs-drawer.component.html',
})
export class LogsDrawerComponent implements OnInit, OnChanges {

  constructor(private dialog: MatDialog,private apiCalls: ApiCallsService, private cdr: ChangeDetectorRef, private utils: Utils, private snackBar: MatSnackBar) {}

  @Input() clickedApplication: string;
  loading = false;
  endPoints = EndPoints;
  logDetails: any[] = [];

  ngOnInit(): void {}

  ngOnChanges(changes: SimpleChanges): void {
    if(changes?.clickedApplication?.currentValue){
      this.clickedApplication = changes.clickedApplication.currentValue;
      this.getLogsDetails(this.clickedApplication);
    }
  }

  editor = InlineEditor;
  // data: any = `<p>Hello, world!</p>`;
  data: any = `Dear {{candidate's Name}}</br></br>
  Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged.
  </br>
  </br>
  Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged.

  `;

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

  getLogsDetails(id: string){
    this.loading = true;
    let queryParam = {
      jobAppId : id
    }
    
    this.apiCalls.get(this.endPoints.GET_APPL_LOGS, queryParam)
      .pipe(catchError(async (error) => {
        this.loading = false;
        this.utils.showErrorDialog(this.dialog, error);
        this.cdr.detectChanges();
    }))
    .subscribe((response) => {
      this.logDetails = response;
      this.loading = false;
      this.cdr.detectChanges();
    });
  }


}


