import { Component, OnInit } from '@angular/core';


@Component({
  selector: 'app-new-task-recr-drawer',
  templateUrl: './new-task-recr-drawer.component.html',
})
export class NewTaskRecrDrawerComponent implements OnInit {



  constructor() {}

  ngOnInit(): void {}

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


