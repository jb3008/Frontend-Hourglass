import { NgModule, APP_INITIALIZER } from '@angular/core';
import {
  MAT_SNACK_BAR_DEFAULT_OPTIONS,
  MatSnackBarModule,
} from '@angular/material/snack-bar';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { HTTP_INTERCEPTORS, HttpClientModule } from '@angular/common/http';
import { HttpClientInMemoryWebApiModule } from 'angular-in-memory-web-api';
import { ClipboardModule } from 'ngx-clipboard';
import { TranslateModule } from '@ngx-translate/core';
import { InlineSVGModule } from 'ng-inline-svg-2';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { AppRoutingModule } from './app-routing.module';
import { LocationStrategy, HashLocationStrategy } from '@angular/common';
import { AppComponent } from './app.component';
import { AuthService } from './modules/auth/services/auth.service';
import { environment } from 'src/environments/environment';
import { MatButtonModule } from '@angular/material/button';

// #fake-start#
import { FakeAPIService } from './_fake/fake-api.service';
import { DialogComponent } from './common/dialog/dialog.component';
import { MatDialogModule } from '@angular/material/dialog';
import { ScrollingModule } from '@angular/cdk/scrolling';
import { CloseScrollStrategy, Overlay } from '@angular/cdk/overlay';
import {
  MAT_AUTOCOMPLETE_SCROLL_STRATEGY,
  MatAutocompleteModule,
} from '@angular/material/autocomplete';
import { ErrorCatchingInterceptor } from './services/error-catching.interceptor';
// #fake-end#

function appInitializer(authService: AuthService) {
  return () => {
    return new Promise((resolve) => {
      //@ts-ignore
      authService.getUserByToken().subscribe().add(resolve);
    });
  };
}
function scrollFactory(overlay: Overlay): () => CloseScrollStrategy {
  return () => overlay.scrollStrategies.close();
}
@NgModule({
  declarations: [AppComponent, DialogComponent],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    TranslateModule.forRoot(),
    HttpClientModule,
    MatSnackBarModule,
    MatButtonModule,
    MatDialogModule,
    // ClipboardModule,
    // #fake-start#
    environment.isMockEnabled
      ? HttpClientInMemoryWebApiModule.forRoot(FakeAPIService, {
          passThruUnknownUrl: true,
          dataEncapsulation: false,
        })
      : [],
    // #fake-end#
    AppRoutingModule,
    InlineSVGModule.forRoot(),
    NgbModule,
  ],
  providers: [
    {
      provide: APP_INITIALIZER,
      useFactory: appInitializer,
      multi: true,
      deps: [AuthService],
    },
    {
      provide: MAT_SNACK_BAR_DEFAULT_OPTIONS,
      useValue: { duration: 3000 },
    },
    { provide: LocationStrategy, useClass: HashLocationStrategy },
    {
      provide: MAT_AUTOCOMPLETE_SCROLL_STRATEGY,
      useFactory: scrollFactory,
      deps: [Overlay],
    },
    {
      provide: HTTP_INTERCEPTORS,
      useClass: ErrorCatchingInterceptor,
      multi: true
   }
  ],
  bootstrap: [AppComponent],
})
export class AppModule {}
