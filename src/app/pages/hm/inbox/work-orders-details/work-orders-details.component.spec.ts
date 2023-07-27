import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WorkOrdersDetailsComponent } from './work-orders-details.component';

describe('WorkOrdersDetailsComponent', () => {
  let component: WorkOrdersDetailsComponent;
  let fixture: ComponentFixture<WorkOrdersDetailsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ WorkOrdersDetailsComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(WorkOrdersDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
