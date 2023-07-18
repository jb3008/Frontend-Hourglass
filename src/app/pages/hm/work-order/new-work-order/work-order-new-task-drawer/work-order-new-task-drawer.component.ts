import { Component, OnInit } from '@angular/core';


@Component({
  selector: 'app-work-order-new-task-drawer',
  templateUrl: './work-order-new-task-drawer.component.html',
})
export class WorkOrderNewTaskDrawerComponent implements OnInit {



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


