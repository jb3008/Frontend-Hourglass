import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TimesheetsDetailsComponent } from './timesheets-details.component';

describe('TimesheetsDetailsComponent', () => {
  let component: TimesheetsDetailsComponent;
  let fixture: ComponentFixture<TimesheetsDetailsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ TimesheetsDetailsComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TimesheetsDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
