import { Component, OnInit } from '@angular/core';
import InlineEditor from '@ckeditor/ckeditor5-build-inline';

@Component({
  selector: 'app-inbox-logs-drawer',
  templateUrl: './inbox-logs-drawer.component.html',
})
export class InboxLogsDrawerComponent implements OnInit {

  constructor() {}

  ngOnInit(): void {}

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


