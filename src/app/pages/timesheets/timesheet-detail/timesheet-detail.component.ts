import {
  AfterViewInit,
  ChangeDetectorRef,
  Component,
  OnInit,
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
@Component({
  selector: 'app-timesheet-detail',
  templateUrl: './timesheet-detail.component.html',
  styleUrls: ['./timesheet-detail.component.scss'],
})
export class TimesheetDetailComponent implements OnInit, AfterViewInit {
  constructor(
    private apiCalls: ApiCallsService,
    private utils: Utils,
    private snackBar: MatSnackBar,
    private cdr: ChangeDetectorRef,
    private authService: AuthService,
    private fb: FormBuilder,
    private route: ActivatedRoute
  ) {}
  endPoints = EndPoints;
  timeSheetDetails: any = {};
  workForceList: any = [];
  isLoading = false;
  timeSheetId: any;
  ngOnInit(): void {
    // DrawerComponent.reinitialization();

    this.timeSheetId = this.route.snapshot.paramMap.get('timeSheetId');
    this.getAllWorkForceList();
  }

  ngAfterViewInit() {
    // setTimeout(() => {
    // console.log(   DrawerComponent.getInstance('kt_logs_drawer_toggle'))
    // DrawerComponent.hideAll();
    // DrawerComponent.updateAll()
    DrawerComponent.reinitialization();
    // }, 0);
  }

  displayedColumns: string[] = [
    'taskId',
    'taskName',
    'priority',
    'timeSpent',
    'eta',
    'lastUpdate',
    'status',
  ];
  dataSource = new MatTableDataSource<PeriodicElement>(ELEMENT_DATA);

  getAllWorkForceList() {
    this.apiCalls
      .get(this.endPoints.LIST_WORK_FORCE, {})
      .pipe(
        catchError(async (err) => {
          this.utils.showSnackBarMessage(
            this.snackBar,
            'failed to fetch the work-force'
          );
          throw err;
        })
      )
      .subscribe((response) => {
        this.workForceList = response;
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
        const emp: any = this.workForceList.find(
          (o: any) =>
            parseInt(o.workForceId) ===
            parseInt(this.timeSheetDetails.employeeId)
        );
        this.timeSheetDetails.employee = emp;
        console.log(this.timeSheetDetails);
        this.isLoading = false;
        this.cdr.detectChanges();
      });
  }
}

export interface PeriodicElement {
  taskId: number;
  taskName: string;
  priority: string;
  // assignTo: string;
  timeSpent: string;
  eta: string;
  lastUpdate: string;
  status: string;
}

const ELEMENT_DATA: PeriodicElement[] = [
  {
    taskId: 8865,
    taskName: 'Some task name that has lengthy characters',
    priority: 'High',
    timeSpent: '38 hrs',
    eta: '28/5/2023',
    lastUpdate: '28/5/2023',
    status: 'In-progress',
  },
  {
    taskId: 8865,
    taskName: 'Some task name that has lengthy characters',
    priority: 'Medium',
    timeSpent: '38 hrs',
    eta: '28/5/2023',
    lastUpdate: '28/5/2023',
    status: 'In-progress',
  },
  {
    taskId: 8865,
    taskName: 'Some task name that has lengthy characters',
    priority: 'Low',
    timeSpent: '38 hrs',
    eta: '28/5/2023',
    lastUpdate: '28/5/2023',
    status: 'In-progress',
  },
  {
    taskId: 8865,
    taskName: 'Some task name that has lengthy characters',
    priority: 'Medium',
    timeSpent: '38 hrs',
    eta: '28/5/2023',
    lastUpdate: '28/5/2023',
    status: 'In-progress',
  },
  {
    taskId: 8865,
    taskName: 'Some task name that has lengthy characters',
    priority: 'High',
    timeSpent: '38 hrs',
    eta: '28/5/2023',
    lastUpdate: '28/5/2023',
    status: 'In-progress',
  },
  // {taskId: 8865, taskName: 'Some task name that has lengthy characters', priority:'Medium', timeSpent: '38 hrs', eta: '28/5/2023', lastUpdate: '28/5/2023', status: 'In-progress'},
  // {taskId: 8865, taskName: 'Some task name that has lengthy characters', priority:'Low', timeSpent: '38 hrs', eta: '28/5/2023', lastUpdate: '28/5/2023', status: 'In-progress'},
  // {taskId: 8865, taskName: 'Some task name that has lengthy characters', priority:'High', timeSpent: '38 hrs', eta: '28/5/2023', lastUpdate: '28/5/2023', status: 'In-progress'},
  // {taskId: 8865, taskName: 'Some task name that has lengthy characters', priority:'Low', timeSpent: '38 hrs', eta: '28/5/2023', lastUpdate: '28/5/2023', status: 'In-progress'},
];
