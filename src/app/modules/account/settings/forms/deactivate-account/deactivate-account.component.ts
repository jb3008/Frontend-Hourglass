import { Component } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Utils } from 'src/app/services/utils';

@Component({
  selector: 'app-deactivate-account',
  templateUrl: './deactivate-account.component.html',
})
export class DeactivateAccountComponent {
  constructor(private snackBar: MatSnackBar, private utils: Utils) {}

  saveSettings() {
    this.utils.showSnackBarMessage(this.snackBar, 'Account has been successfully deleted!');
  }
}
