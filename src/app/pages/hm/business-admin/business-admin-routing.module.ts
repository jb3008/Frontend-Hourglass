import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { BusinessAdminComponent } from './business-admin.component';

const routes: Routes = [{ path: '', component: BusinessAdminComponent }];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class BusinessAdminRoutingModule { }
