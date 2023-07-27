import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InvoicesDetailsComponent } from './invoices-details.component';

describe('InvoicesDetailsComponent', () => {
  let component: InvoicesDetailsComponent;
  let fixture: ComponentFixture<InvoicesDetailsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ InvoicesDetailsComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(InvoicesDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
