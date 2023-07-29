import { NgModule } from '@angular/core';
import { DropzoneDirective } from './directive/dropzone.directive';
import { InboxLogsDrawerComponent } from './inbox-drawer/inbox-logs-drawer/inbox-logs-drawer.component';
import { InboxAttachmentLogsDrawerComponent } from './inbox-drawer/inbox-attachment-logs-drawer/inbox-attachment-logs-drawer.component';
import { InboxCollaborateDrawerComponent } from './inbox-drawer/inbox-collaborate-drawer/inbox-collaborate-drawer.component';
import { InboxRejectDrawerComponent } from './inbox-drawer/inbox-reject-drawer/inbox-reject-drawer.component';
import { InboxApproveDrawerComponent } from './inbox-drawer/inbox-approve-drawer/inbox-approve-drawer.component';
import { InlineSVGModule } from 'ng-inline-svg-2';
import { CommonModule } from '@angular/common';

@NgModule({
  exports: [ 
    DropzoneDirective,
    InboxLogsDrawerComponent,
    InboxAttachmentLogsDrawerComponent,
    InboxCollaborateDrawerComponent,
    InboxRejectDrawerComponent,
    InboxApproveDrawerComponent,
    
  ],
  declarations: [DropzoneDirective,
    InboxLogsDrawerComponent,
    InboxAttachmentLogsDrawerComponent,
    InboxCollaborateDrawerComponent,
    InboxRejectDrawerComponent,
    InboxApproveDrawerComponent,
    ],
    imports:[
      CommonModule
    ]
})
export class SharedModule {}
