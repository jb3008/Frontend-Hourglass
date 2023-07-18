import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { WorkOrderComponent } from './work-order.component';
import { NewWorkOrderComponent } from './new-work-order/new-work-order.component';
import { WorkOrderDetailsComponent } from './work-order-details/work-order-details.component';

const routes: Routes = [{ path: '', component: WorkOrderComponent },
{ path: 'new-work-order', component: NewWorkOrderComponent },
{ path: 'details', component: WorkOrderDetailsComponent },

];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class WorkOrderRoutingModule { }
