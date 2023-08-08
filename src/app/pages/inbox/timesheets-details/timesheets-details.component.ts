import {
  AfterViewInit,
  ChangeDetectorRef,
  Component,
  OnInit,
  ViewChild,
} from '@angular/core';
import { NgbAccordionModule } from '@ng-bootstrap/ng-bootstrap';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { DrawerComponent } from 'src/app/_metronic/kt/components';
import EndPoints from 'src/app/common/endpoints';
import { ApiCallsService } from 'src/app/services/api-calls.service';
import { Utils } from 'src/app/services/utils';
import { Observable, catchError, throwError } from 'rxjs';
import { AuthService } from 'src/app/modules/auth';
import { MatSnackBar } from '@angular/material/snack-bar';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { ModalComponent, ModalConfig } from 'src/app/_metronic/partials';
@Component({
  selector: 'app-timesheet-detail',
  templateUrl: './timesheets-details.component.html',
  styleUrls: ['./timesheets-details.component.scss'],
})
export class TimesheetDetailComponent implements OnInit, AfterViewInit {
  constructor(
    private apiCalls: ApiCallsService,
    private utils: Utils,
    private snackBar: MatSnackBar,
    private cdr: ChangeDetectorRef,
    private authService: AuthService,
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private _formBuilder: FormBuilder
  ) {}

  endPoints = EndPoints;
  timeSheetDetails: any = {};
  workForceList: any = [];
  isLoading = false;
  timeSheetId: any;
  workOrderId: any = '';
  selectedEmpObj: any = null;
  taskListDetails: any = [];
  totalTimeSpent: number = 0;
  newTimeSheetTaskList: any = [];
  alreadyTaskList: any = [];
  VOForm: FormGroup;
  startDate: any;
  isEditableNew: boolean = true;
  lstTimeSheetStatus: any;
  auth: any;

  today = new Date();
  ngOnInit(): void {
    this.auth = this.utils.getAuth();

    this.timeSheetId = this.route.snapshot.paramMap.get('timeSheetId');
    this.getAllTimeSheetStatus();
  }

  ngAfterViewInit() {
    DrawerComponent.reinitialization();
  }

  displayedColumns: string[] = [
    'taskId',
    'title',
    'priority',
    'timeSpent',
    'startDate',
    'finishDate',
    'status',
    // 'actions',
  ];
  dataSource: any;

  getAllTimeSheetStatus() {
    this.apiCalls
      .get(this.endPoints.GET_TIMESHEET_STATUS, {})
      .pipe(
        catchError(async (err) => {
          this.utils.showSnackBarMessage(
            this.snackBar,
            'failed to fetch the timesheet-status'
          );
          throw err;
        })
      )
      .subscribe((response) => {
        this.lstTimeSheetStatus = response;
        this.getAllTimesheetDetails();
        this.cdr.detectChanges();
      });
  }
  getAllTimesheetDetails() {
    this.isLoading = true;

    this.apiCalls
      .get(this.endPoints.GET_TIME_SHEET_DETAILS, {
        timeSheetId: this.timeSheetId,
      })
      .pipe(
        catchError(async (err) => {
          this.utils.showSnackBarMessage(
            this.snackBar,
            'failed to fetch the time-sheet-details'
          );
          this.isLoading = false;
          this.cdr.detectChanges();
          throw err;
        })
      )
      .subscribe((response) => {
        this.timeSheetDetails = response;
        // this.timeSheetDetails.displayStatus = this.lstTimeSheetStatus.length
        //   ? this.lstTimeSheetStatus.find(
        //       (r: any) => r.code === this.timeSheetDetails.status
        //     ).title
        //   : '';
        this.timeSheetDetails.taskListDetails =
          this.timeSheetDetails.taskListDetails &&
          this.timeSheetDetails.taskListDetails.length
            ? this.timeSheetDetails.taskListDetails.filter((r: any) => {
                r.isNew = false;
                r.status = r.displayStatus;
                r.startDate = new Date(r.startDate).toISOString();
                return r;
              })
            : [];

        this.timeSheetDetails.taskListDetails =
          this.timeSheetDetails.taskListDetails.sort(function (a: any, b: any) {
            // Turn your strings into dates, and then subtract them
            // to get a value that is either negative, positive, or zero.
            return (
              new Date(a.startDate).getTime() - new Date(b.startDate).getTime()
            );
          });
        const groups = this.timeSheetDetails.taskListDetails.reduce(
          (groups: any, timeSheet: any) => {
            const today = new Date(timeSheet.startDate);
            const yyyy = today.getFullYear();
            let mm: any = today.getMonth() + 1; // Months start at 0!
            let dd: any = today.getDate();

            if (dd < 10) dd = '0' + dd;
            if (mm < 10) mm = '0' + mm;

            const date = dd + '/' + mm + '/' + yyyy;

            if (!groups[date]) {
              groups[date] = [];
            }
            groups[date].push(timeSheet);
            return groups;
          },
          {}
        );

        // Edit: to add it in the array format instead
        const groupArrays = Object.keys(groups).map((date) => {
          return {
            date,
            data: groups[date],
          };
        });
        this.taskListDetails = groupArrays;
        this.dataSource = {};
        this.totalTimeSpent = 0;
        const ids = [];
        for (let index = 0; index < this.taskListDetails.length; index++) {
          const element = this.taskListDetails[index];

          element.timeSpent = 0;
          for (let i = 0; i < element.data.length; i++) {
            element.timeSpent += element.data[i].timeSpent
              ? parseInt(element.data[i].timeSpent)
              : 0;
            ids.push(element.data[i].taskId);
          }
          this.totalTimeSpent += element.timeSpent;

          this.dataSource[element.date] = new MatTableDataSource<any>(
            element.data
          );
        }

        this.alreadyTaskList = ids;
        this.workOrderId = this.timeSheetDetails.workOrderId;
        this.selectedEmpObj = this.timeSheetDetails.workForceDetails;

        this.startDate = this.taskListDetails.length
          ? this.taskListDetails[0].date
          : '';
        this.isLoading = false;
        this.cdr.detectChanges();
      });
  }
  getSelectedTaskList(selectedTask: any) {
    const today = new Date();
    const yyyy = today.getFullYear();
    let mm: any = today.getMonth() + 1; // Months start at 0!
    let dd: any = today.getDate();

    if (dd < 10) dd = '0' + dd;
    if (mm < 10) mm = '0' + mm;
    const date = dd + '/' + mm + '/' + yyyy;
    this.startDate = this.startDate ? this.startDate : date;
    let [day, month, year] = this.startDate.split('/');
    const dateObj = new Date(+year, +month - 1, +day);
    if (selectedTask.length) {
      for (let index = 0; index < selectedTask.length; index++) {
        const element = selectedTask[index];
        this.timeSheetDetails.taskListDetails.push({
          taskId: element.taskId,
          timeSpent: 0,
          startDate: new Date(dateObj),
          finishDate: new Date(dateObj),
          timeSheetTaskId: this.timeSheetDetails.taskListDetails.length
            ? this.timeSheetDetails.taskListDetails[
                this.timeSheetDetails.taskListDetails.length - 1
              ].timeSheetTaskId + 1
            : 1,
          title: element.title,
          status: element.displayStatus,
          priority: element.priority,
          isNew: true,
        });
      }
    }

    this.timeSheetDetails.taskListDetails =
      this.timeSheetDetails.taskListDetails.sort(function (a: any, b: any) {
        // Turn your strings into dates, and then subtract them
        // to get a value that is either negative, positive, or zero.
        return (
          new Date(a.startDate).getTime() - new Date(b.startDate).getTime()
        );
      });
    const groups = this.timeSheetDetails.taskListDetails.reduce(
      (groups: any, timeSheet: any) => {
        const today = new Date(timeSheet.startDate);
        const yyyy = today.getFullYear();
        let mm: any = today.getMonth() + 1; // Months start at 0!
        let dd: any = today.getDate();

        if (dd < 10) dd = '0' + dd;
        if (mm < 10) mm = '0' + mm;

        const date = dd + '/' + mm + '/' + yyyy;
        if (!groups[date]) {
          groups[date] = [];
        }
        groups[date].push(timeSheet);
        return groups;
      },
      {}
    );

    // Edit: to add it in the array format instead
    const groupArrays = Object.keys(groups).map((date) => {
      return {
        date,
        data: groups[date],
      };
    });
    this.taskListDetails = groupArrays;
    this.dataSource = {};
    this.totalTimeSpent = 0;
    const ids = [];
    for (let index = 0; index < this.taskListDetails.length; index++) {
      const element = this.taskListDetails[index];

      element.timeSpent = 0;
      for (let i = 0; i < element.data.length; i++) {
        element.timeSpent += element.data[i].timeSpent
          ? parseInt(element.data[i].timeSpent)
          : 0;
        ids.push(element.data[i].taskId);
      }

      this.totalTimeSpent += element.timeSpent;
      this.dataSource[element.date] = new MatTableDataSource<any>(element.data);
    }
    this.alreadyTaskList = ids;
    this.cdr.detectChanges();
  }
  changeDateToUtc(dateObj: any) {
    const date = new Date(dateObj);
    const utcDate = date.toISOString();
    return utcDate;
  }
  clickAccordion(date: any) {
    this.startDate = date;
    this.cdr.detectChanges();
  }

  async save(status: string) {
    let formData: any = {
      id: this.timeSheetDetails.timeSheetId,
      employeeId: this.timeSheetDetails.employeeId,
      workOrderId: this.timeSheetDetails.workOrderId,
      fromDate: this.changeDateToUtc(this.timeSheetDetails.fromDate),
      toDate: this.changeDateToUtc(this.timeSheetDetails.toDate),
      comments: this.timeSheetDetails.comments,
      status: this.timeSheetDetails.status,
    };
    const newTimeSheetTaskList = [];
    const existingTimeSheetTaskList = [];
    for (
      let index = 0;
      index < this.timeSheetDetails.taskListDetails.length;
      index++
    ) {
      const element = this.timeSheetDetails.taskListDetails[index];
      if (!element.isNew) {
        existingTimeSheetTaskList.push({
          taskId: element.taskId,
          timeSpent: element.timeSpent,
          startDate: element.startDate,
          dueDate: element.finishDate,
          timeSheetTaskId: element.timeSheetTaskId,
        });
      } else {
        newTimeSheetTaskList.push({
          taskId: element.taskId,
          timeSpent: element.timeSpent,
          startDate: element.startDate,
          dueDate: element.finishDate,
          timeSheetTaskId: 0,
        });
      }
    }
    if (existingTimeSheetTaskList.length) {
      formData.existingTimeSheetTaskList = existingTimeSheetTaskList;
    }
    if (newTimeSheetTaskList.length) {
      formData.newTimeSheetTaskList = newTimeSheetTaskList;
    }
    this.isLoading = true;

    this.apiCalls
      .post(this.getEndpoint(status), formData)
      .pipe(
        catchError(async (err) => {
          this.isLoading = false;
          setTimeout(() => {
            throw err;
          }, 10);
          this.utils.showSnackBarMessage(this.snackBar, 'Something went wrong');
          this.cdr.detectChanges();
        })
      )
      .subscribe(async (response) => {
        if (this.isLoading) {
          this.isLoading = false;
          this.ngOnInit();
          this.utils.showSnackBarMessage(
            this.snackBar,
            'Time sheet created successfully'
          );
        }
      });
  }

  async removeTaskFromTimeSheet(obj: any, date: any, index: number) {
    if (!obj.isNew) {
      this.isLoading = true;
      this.apiCalls
        .post(this.endPoints.REMOVE_TASK_FROM_TIMESHEET, '', {
          timeSheetTaskId: obj.timeSheetTaskId,
        })
        .pipe(
          catchError(async (err) => {
            this.isLoading = false;
            setTimeout(() => {
              throw err;
            }, 10);
            this.utils.showSnackBarMessage(
              this.snackBar,
              'Something went wrong'
            );
            this.cdr.detectChanges();
          })
        )
        .subscribe(async (response) => {
          if (this.isLoading) {
            this.timeSheetDetails.taskListDetails =
              this.timeSheetDetails.taskListDetails.filter((r: any) => {
                return r.timeSheetTaskId !== obj.timeSheetTaskId;
              });

            this.isLoading = false;
            this.timeSheetDetails.taskListDetails =
              this.timeSheetDetails.taskListDetails.sort(function (
                a: any,
                b: any
              ) {
                // Turn your strings into dates, and then subtract them
                // to get a value that is either negative, positive, or zero.
                return (
                  new Date(a.startDate).getTime() -
                  new Date(b.startDate).getTime()
                );
              });
            const groups = this.timeSheetDetails.taskListDetails.reduce(
              (groups: any, timeSheet: any) => {
                const today = new Date(timeSheet.startDate);
                const yyyy = today.getFullYear();
                let mm: any = today.getMonth() + 1; // Months start at 0!
                let dd: any = today.getDate();

                if (dd < 10) dd = '0' + dd;
                if (mm < 10) mm = '0' + mm;

                const date = dd + '/' + mm + '/' + yyyy;
                if (!groups[date]) {
                  groups[date] = [];
                }
                groups[date].push(timeSheet);
                return groups;
              },
              {}
            );

            // Edit: to add it in the array format instead
            const groupArrays = Object.keys(groups).map((date) => {
              return {
                date,
                data: groups[date],
              };
            });
            this.taskListDetails = groupArrays;
            this.dataSource = {};
            this.totalTimeSpent = 0;
            const ids = [];
            for (let index = 0; index < this.taskListDetails.length; index++) {
              const element = this.taskListDetails[index];

              element.timeSpent = 0;
              for (let i = 0; i < element.data.length; i++) {
                element.timeSpent += element.data[i].timeSpent
                  ? parseInt(element.data[i].timeSpent)
                  : 0;
                ids.push(element.data[i].taskId);
              }

              this.totalTimeSpent += element.timeSpent;
              this.dataSource[element.date] = new MatTableDataSource<any>(
                element.data
              );
            }
            this.alreadyTaskList = ids;
            this.utils.showSnackBarMessage(
              this.snackBar,
              'Task Removed successfully'
            );
            this.cdr.detectChanges();
          }
        });
    } else {
      this.timeSheetDetails.taskListDetails =
        this.timeSheetDetails.taskListDetails.filter((r: any) => {
          return r.timeSheetTaskId !== obj.timeSheetTaskId;
        });

      this.isLoading = false;
      this.timeSheetDetails.taskListDetails =
        this.timeSheetDetails.taskListDetails.sort(function (a: any, b: any) {
          // Turn your strings into dates, and then subtract them
          // to get a value that is either negative, positive, or zero.
          return (
            new Date(a.startDate).getTime() - new Date(b.startDate).getTime()
          );
        });
      const groups = this.timeSheetDetails.taskListDetails.reduce(
        (groups: any, timeSheet: any) => {
          const today = new Date(timeSheet.startDate);
          const yyyy = today.getFullYear();
          let mm: any = today.getMonth() + 1; // Months start at 0!
          let dd: any = today.getDate();

          if (dd < 10) dd = '0' + dd;
          if (mm < 10) mm = '0' + mm;

          const date = dd + '/' + mm + '/' + yyyy;
          if (!groups[date]) {
            groups[date] = [];
          }
          groups[date].push(timeSheet);
          return groups;
        },
        {}
      );

      // Edit: to add it in the array format instead
      const groupArrays = Object.keys(groups).map((date) => {
        return {
          date,
          data: groups[date],
        };
      });
      this.taskListDetails = groupArrays;
      this.dataSource = {};
      this.totalTimeSpent = 0;
      const ids = [];
      for (let index = 0; index < this.taskListDetails.length; index++) {
        const element = this.taskListDetails[index];

        element.timeSpent = 0;
        for (let i = 0; i < element.data.length; i++) {
          element.timeSpent += element.data[i].timeSpent
            ? parseInt(element.data[i].timeSpent)
            : 0;
          ids.push(element.data[i].taskId);
        }

        this.totalTimeSpent += element.timeSpent;
        this.dataSource[element.date] = new MatTableDataSource<any>(
          element.data
        );
      }
      this.alreadyTaskList = ids;
      this.utils.showSnackBarMessage(
        this.snackBar,
        'Task Removed successfully'
      );
      this.cdr.detectChanges();
    }
  }
  getEndpoint(status: string) {
    return status === 'Draft'
      ? this.endPoints.CREATE_TIME_SHEET_AS_DRAFT
      : this.endPoints.CREATE_TIME_SHEET;
  }
}

export interface PeriodicElement {
  taskId: number;
  title: string;
  priority: string;
  // assignTo: string;
  timeSpent: string;
  startDate: string;
  finishDate: string;
  status: string;
}
