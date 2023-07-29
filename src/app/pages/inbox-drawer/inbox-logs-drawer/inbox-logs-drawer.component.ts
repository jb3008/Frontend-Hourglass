import { ChangeDetectorRef, Component, Input, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import InlineEditor from '@ckeditor/ckeditor5-build-inline';
import { catchError } from 'rxjs';
import EndPoints from 'src/app/common/endpoints';
import { ApiCallsService } from 'src/app/services/api-calls.service';
import { Utils } from 'src/app/services/utils';

@Component({
  selector: 'app-inbox-logs-drawer',
  templateUrl: './inbox-logs-drawer.component.html',
})
export class InboxLogsDrawerComponent implements OnInit, OnChanges {

  constructor(private apiCalls: ApiCallsService, private utils: Utils, private snackBar: MatSnackBar,
      private cdr: ChangeDetectorRef) {}

  @Input() workOrderId: any;
  endPoints = EndPoints;
  logs: any[] = [];

  ngOnInit(): void {}

  ngOnChanges(changes: SimpleChanges): void {
    if(changes?.workOrderId?.currentValue){
      this.getLogs(changes.workOrderId.currentValue);
    }
  }

  getLogs(id: string){
    let queryParam = {
      workOrderId : id
    }

    this.apiCalls.get(this.endPoints.GET_WORKORDER_LOGS, queryParam)
      .pipe(
        catchError(async (err) => {
          this.utils.showSnackBarMessage(this.snackBar, 'failed to fetch the work order logs');
          throw err;
        })
      )
      .subscribe((response) => {
        this.logs = response;
        this.cdr.detectChanges();
      });

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


}


