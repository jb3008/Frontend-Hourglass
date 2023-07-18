import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WorkOrderDetailsComponent } from './work-order-details.component';

describe('WorkOrderDetailsComponent', () => {
  let component: WorkOrderDetailsComponent;
  let fixture: ComponentFixture<WorkOrderDetailsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ WorkOrderDetailsComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(WorkOrderDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
