import { Injectable } from '@angular/core';
import { isEqual } from 'lodash';

import { DialogComponent } from 'src/app/common/dialog/dialog.component';
import { AuthModel } from '../modules/auth/models/auth.model';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root',
})
export class Utils {
  private authLocalStorageToken = `${environment.appVersion}-${environment.USERDATA_KEY}`;
  clearFileInput(element: any) {
    // hack  to reset file input. Otherwise, same file cannot be selected again.
    const elementType = element.target.type;
    element.target.type = '';
    element.target.type = elementType;
  }

  isFileExist(fileList: any, file: any) {
    for (let fileObj of fileList) {
      if (
        isEqual(fileObj.name, file.name) &&
        isEqual(fileObj.lastModified, file.lastModified) &&
        isEqual(fileObj.size, file.size) &&
        isEqual(fileObj.type, file.type)
      ) {
        return true;
      }
    }
    return false;
  }

  showSnackBarMessage(snackBar: any, message: string) {
    snackBar.open(message, '', { duration: 3000 }); // show message for 3 seconds only.
  }

  showDialog(dialog: any, msg: any, callback: any = null) {
    let dialogRef = dialog.open(DialogComponent, {
      data: {
        message: msg,
        disableClose: true,
      },
      width: '400px',
      // height: '130px' //16-Jul-23 to solve dialog issue.
    });

    if (callback != null) {
      dialogRef.afterClosed().subscribe(callback);
    }

    return dialogRef;
  }

  showDialogWithCancelButton(dialog: any, msg: any, callback: any = null) {
    let dialogRef = dialog.open(DialogComponent, {
      data: {
        message: msg,
        disableClose: false,
      },
      width: '400px',
      // height: '130px'  //16-Jul-23 to solve dialog issue.
    });

    if (callback != null) {
      dialogRef.afterClosed().subscribe(callback);
    }

    return dialogRef;
  }

  setVendorId(vendorId: string) {
    sessionStorage.setItem('vendorId', vendorId);
  }

  getVendorId() {
    return sessionStorage.getItem('vendorId');
  }

  setHiringManager(value: string) {
    sessionStorage.setItem('setHiringManger', value);
  }

  isHiringManagerSet() {
    return sessionStorage.getItem('setHiringManger');
  }

  setUser(user: string) {
    sessionStorage.setItem('user', user);
  }

  getUser() {
    return sessionStorage.getItem('user');
  }

  changeDateToUtc(dateObj: any) {
    const date = new Date(dateObj);
    const utcDate = date.toISOString();
    return utcDate;
  }

  getDocIcon(fileName: string) {
    switch (fileName.substring(fileName.lastIndexOf('.') + 1)) {
      case 'doc':
      case 'docx':
        return './assets/media/svg/files/doc.svg';

      case 'pdf':
        return './assets/media/svg/files/pdf.svg';

      case 'xls':
      case 'xlsx':
        return './assets/media/svg/files/xls.svg'; // TODO: need  to change this icon when available.

      default:
        return './assets/media/svg/files/blank-image.svg'; // TODO: need  to change this icon when available.
    }
  }
  getAuth(): AuthModel | undefined {
    try {
      const lsValue = localStorage.getItem(this.authLocalStorageToken);
      if (!lsValue) {
        return undefined;
      }

      const authData = JSON.parse(lsValue);
      return authData;
    } catch (error) {
      console.error(error);
      return undefined;
    }
  }
}
