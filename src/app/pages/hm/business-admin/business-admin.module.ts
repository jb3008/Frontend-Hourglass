import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { BusinessAdminRoutingModule } from './business-admin-routing.module';
import { BusinessAdminComponent } from './business-admin.component';


@NgModule({
  declarations: [
    BusinessAdminComponent
  ],
  imports: [
    CommonModule,
    BusinessAdminRoutingModule
  ]
})
export class BusinessAdminModule { }
