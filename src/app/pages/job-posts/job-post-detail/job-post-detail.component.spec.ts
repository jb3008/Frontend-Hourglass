import { ComponentFixture, TestBed } from '@angular/core/testing';

import { JobPostDetailComponent } from './job-post-detail.component';

describe('JobPostDetailComponent', () => {
  let component: JobPostDetailComponent;
  let fixture: ComponentFixture<JobPostDetailComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ JobPostDetailComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(JobPostDetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
