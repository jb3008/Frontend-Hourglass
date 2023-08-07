import { Routes } from '@angular/router';

const Routing: Routes = [
  {
    path: 'dashboard',
    loadChildren: () =>
      import('./dashboard/dashboard.module').then((m) => m.DashboardModule),
  },
  {
    path: 'job-posts',
    loadChildren: () =>
      import('./job-posts/job-posts.module').then((m) => m.JobPostsModule),
  },
  {
    path: 'hm/job-posts',
    loadChildren: () =>
      import('./hm/job-posts/job-posts.module').then((m) => m.JobPostsModule),
  },

  {
    path: 'hm/work-order',
    loadChildren: () =>
      import('./hm/work-order/work-order.module').then(
        (m) => m.WorkOrderModule
      ),
  },
  // {
  //   path: 'hm/inbox',
  //   loadChildren: () =>
  //     import('./hm/inbox/inbox.module').then((m) => m.InboxModule),
  // },

  {
    path: 'work-order',
    loadChildren: () =>
      import('./work-order/work-order.module').then((m) => m.WorkOrderModule),
  },
  {
    path: 'work-force',
    loadChildren: () =>
      import('./work-force/work-force.module').then((m) => m.WorkForceModule),
  },
  {
    path: 'timesheets',
    loadChildren: () =>
      import('./timesheets/timesheets.module').then((m) => m.TimesheetsModule),
  },
  {
    path: 'hm/timesheets',
    loadChildren: () =>
      import('./timesheets/timesheets.module').then((m) => m.TimesheetsModule),
  },
  {
    path: 'invoices',
    loadChildren: () =>
      import('./invoices/invoices.module').then((m) => m.InvoicesModule),
  },

  {
    path: 'business-admin',
    loadChildren: () =>
      import('./hm/business-admin/business-admin.module').then(
        (m) => m.BusinessAdminModule
      ),
  },
  {
    path: 'admin',
    loadChildren: () =>
      import('./hm/admin/admin.module').then((m) => m.AdminModule),
  },

  {
    path: 'inbox',
    loadChildren: () =>
      import('./inbox/inbox.module').then((m) => m.InboxModule),
  },
  {
    path: 'hm/inbox',
    loadChildren: () =>
      import('./hm/inbox/inbox.module').then((m) => m.InboxModule),
  },
  // { path: 'job-posts-details', component: JobPostDetailComponent },

  // {
  //   path: 'builder',
  //   loadChildren: () =>
  //     import('./builder/builder.module').then((m) => m.BuilderModule),
  // },
  // {
  //   path: 'crafted/pages/profile',
  //   loadChildren: () =>
  //     import('../modules/profile/profile.module').then((m) => m.ProfileModule),
  //   data: { layout: 'light-sidebar' },
  // },
  // {
  //   path: 'crafted/account',
  //   loadChildren: () =>
  //     import('../modules/account/account.module').then((m) => m.AccountModule),
  //   data: { layout: 'dark-header' },
  // },
  // {
  //   path: 'crafted/pages/wizards',
  //   loadChildren: () =>
  //     import('../modules/wizards/wizards.module').then((m) => m.WizardsModule),
  //   data: { layout: 'light-header' },
  // },
  // {
  //   path: 'crafted/widgets',
  //   loadChildren: () =>
  //     import('../modules/widgets-examples/widgets-examples.module').then(
  //       (m) => m.WidgetsExamplesModule
  //     ),
  //   data: { layout: 'light-header' },
  // },
  // {
  //   path: 'apps/chat',
  //   loadChildren: () =>
  //     import('../modules/apps/chat/chat.module').then((m) => m.ChatModule),
  //   data: { layout: 'light-sidebar' },
  // },
  {
    path: '',
    redirectTo: '/hm/job-posts',
    pathMatch: 'full',
  },
  {
    path: '**',
    redirectTo: 'error/404',
  },
];

export { Routing };
