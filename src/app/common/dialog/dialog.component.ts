import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { Router } from '@angular/router';

@Component({
  selector: 'app-dialog',
  templateUrl: './dialog.component.html',
  styleUrls: ['./dialog.component.scss']
})
export class DialogComponent implements OnInit {

  message: string;
  showCancel: boolean;
  constructor(@Inject(MAT_DIALOG_DATA) private data: { message: string, disableClose: boolean }, private router: Router, private dialogRef: MatDialogRef<DialogComponent>) { 
    dialogRef.disableClose = true;
    if(data){
      this.message = data.message
      dialogRef.disableClose = data.disableClose;
      this.showCancel = !data.disableClose;
    }
  }


  ngOnInit(): void {
  }

  closeDialog(result: boolean){
    this.dialogRef.close(result);
  }
}
