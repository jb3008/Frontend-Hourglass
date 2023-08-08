import { NgModule } from '@angular/core';
import { DropzoneDirective } from './directive/dropzone.directive';
import { InboxLogsDrawerComponent } from './inbox-drawer/inbox-logs-drawer/inbox-logs-drawer.component';
import { InboxAttachmentLogsDrawerComponent } from './inbox-drawer/inbox-attachment-logs-drawer/inbox-attachment-logs-drawer.component';
import { InboxCollaborateDrawerComponent } from './inbox-drawer/inbox-collaborate-drawer/inbox-collaborate-drawer.component';
import { InboxRejectDrawerComponent } from './inbox-drawer/inbox-reject-drawer/inbox-reject-drawer.component';
// import { InboxApproveDrawerComponent } from './inbox-drawer/inbox-approve-drawer/inbox-approve-drawer.component';
import { InlineSVGModule } from 'ng-inline-svg-2';
import { CommonModule } from '@angular/common';
import { AttachmentLogsDrawerComponent } from './timesheets/timesheet-detail/attachment-logs-drawer/attachment-logs-drawer.component';
import { TimesheetLogsDrawerComponent } from './timesheets/timesheet-detail/timesheet-logs-drawer/timesheet-logs-drawer.component';
import { NgxDocViewerModule } from 'ngx-doc-viewer';
import { ModalsModule } from '../_metronic/partials';
import { FormsModule } from '@angular/forms';
import { InboxInvoiceAttachmentLogsDrawerComponent } from './invoices/invoices-details/inbox-attachment-logs-drawer/inbox-attachment-logs-drawer.component';
import { InboxInvoiceLogsDrawerComponent } from './invoices/invoices-details/inbox-logs-drawer/inbox-logs-drawer.component';

@NgModule({
  exports: [
    DropzoneDirective,
    InboxLogsDrawerComponent,
    InboxAttachmentLogsDrawerComponent,
    InboxCollaborateDrawerComponent,
    // InboxRejectDrawerComponent,
    AttachmentLogsDrawerComponent,
    TimesheetLogsDrawerComponent,
    InboxInvoiceAttachmentLogsDrawerComponent,
    InboxInvoiceLogsDrawerComponent,
    // InboxApproveDrawerComponent,
  ],
  declarations: [
    DropzoneDirective,
    InboxLogsDrawerComponent,
    InboxAttachmentLogsDrawerComponent,
    InboxCollaborateDrawerComponent,
    // InboxRejectDrawerComponent,
    AttachmentLogsDrawerComponent,
    TimesheetLogsDrawerComponent,
    InboxInvoiceAttachmentLogsDrawerComponent,
    InboxInvoiceLogsDrawerComponent,
    // InboxApproveDrawerComponent,
  ],
  imports: [
    CommonModule,
    InlineSVGModule,
    NgxDocViewerModule,
    ModalsModule,
    FormsModule,
  ],
})
export class SharedModule {}
