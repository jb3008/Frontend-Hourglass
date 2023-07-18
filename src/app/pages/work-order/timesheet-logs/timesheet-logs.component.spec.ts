import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TimesheetLogsComponent } from './timesheet-logs.component';

describe('TimesheetLogsComponent', () => {
  let component: TimesheetLogsComponent;
  let fixture: ComponentFixture<TimesheetLogsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ TimesheetLogsComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TimesheetLogsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
