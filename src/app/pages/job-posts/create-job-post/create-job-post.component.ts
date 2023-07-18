import { Component, OnInit } from '@angular/core';
import InlineEditor from '@ckeditor/ckeditor5-build-inline';

@Component({
  selector: 'app-create-job-post',
  templateUrl: './create-job-post.component.html',
  styleUrls: ['./create-job-post.component.scss']
})
export class CreateJobPostComponent implements OnInit {

  constructor() { }

  ngOnInit(): void {
  }
  editor = InlineEditor;
  // data: any = `<p>Hello, world!</p>`;
  data: any = '';


   onReady(eventData:any) {
    eventData.plugins.get('FileRepository').createUploadAdapter = function (loader:any) {
      console.log('loader : ', loader)
      console.log(btoa(loader.file));
      // return new UploadAdapter(loader);
    };
  }




}
