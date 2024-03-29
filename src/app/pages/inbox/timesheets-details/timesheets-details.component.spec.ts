import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TimesheetDetailComponent } from './timesheets-details.component';

describe('TimesheetDetailComponent', () => {
  let component: TimesheetDetailComponent;
  let fixture: ComponentFixture<TimesheetDetailComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [TimesheetDetailComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(TimesheetDetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
