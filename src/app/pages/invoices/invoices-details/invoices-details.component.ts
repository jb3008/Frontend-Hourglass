import { Component, OnInit } from '@angular/core';
import { DrawerComponent } from 'src/app/_metronic/kt/components';

@Component({
  selector: 'app-invoices-details',
  templateUrl: './invoices-details.component.html',
  styleUrls: ['./invoices-details.component.scss'],
})
export class InvoicesDetailsComponent implements OnInit {
  constructor() {}

  ngOnInit(): void {}

  ngAfterViewInit() {
    DrawerComponent.reinitialization();
  }
}
