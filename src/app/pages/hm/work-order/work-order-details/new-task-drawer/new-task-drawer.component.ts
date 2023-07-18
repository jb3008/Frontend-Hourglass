import { Component, OnInit } from '@angular/core';


@Component({
  selector: 'app-new-task-drawer',
  templateUrl: './new-task-drawer.component.html',
})
export class NewTaskDrawerComponent implements OnInit {



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


