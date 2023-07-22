import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Subscription, Observable } from 'rxjs';
import { catchError, first } from 'rxjs/operators';
import { UserModel } from '../../models/user.model';
import { AuthService } from '../../services/auth.service';
import { ActivatedRoute, Router } from '@angular/router';
import { Utils } from 'src/app/services/utils';
import { ApiCallsService } from 'src/app/services/api-calls.service';
import EndPoints from 'src/app/common/endpoints';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
})
export class LoginComponent implements OnInit, OnDestroy {
  // KeenThemes mock, change it to:
  defaultAuth: any = {
    userId: 'user-1',
    password: '123456',
  };
  loginForm: FormGroup;
  hasError: boolean;
  returnUrl: string;
  isLoading$: Observable<boolean>;
  endPoints = EndPoints;

  // private fields
  private unsubscribe: Subscription[] = []; // Read more: => https://brianflove.com/2016/12/11/anguar-2-unsubscribe-observables/

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private route: ActivatedRoute,
    private router: Router,
    private utils: Utils,
    private apiCalls: ApiCallsService
  ) {
    this.isLoading$ = this.authService.isLoading$;
    // redirect to home if already logged in
    if (this.authService.currentUserValue) {
      this.router.navigate(['/']);
    }
  }

  ngOnInit(): void {
    this.initForm();
    // get return url from route parameters or default to '/'
    this.returnUrl =
      this.route.snapshot.queryParams['returnUrl'.toString()] || '/';
  }

  // convenience getter for easy access to form fields
  get f() {
    return this.loginForm.controls;
  }

  initForm() {
    this.loginForm = this.fb.group({
      userId: [
        this.defaultAuth.userId,
        Validators.compose([Validators.required]),
      ],
      password: [
        this.defaultAuth.password,
        Validators.compose([
          Validators.required,
          Validators.minLength(3),
          Validators.maxLength(100),
        ]),
      ],
    });
  }

  submit() {
    this.hasError = false;
    const loginSubscr = this.authService
      .login(this.f.userId.value, this.f.password.value)
      .pipe(first())
      .subscribe((user: UserModel | undefined) => {
        const auth = this.utils.getAuth();
        if (auth) {
          if (auth.vendorId) {
            this.getVendorDetails(auth.vendorId);
            this.router.navigate(['/job-posts']);
          } else {
            this.router.navigate(['/hm/job-posts']);
          }
        } else {
          this.hasError = true;
        }
      });
    this.unsubscribe.push(loginSubscr);
  }

  getVendorDetails(id: any){
    let queryParam = {
      vendorCode : id
    }
    this.apiCalls.get(this.endPoints.GET_VENDOR_DETAILS, queryParam)
      .pipe(catchError(async (error) => {
        throw error;
      }))
      .subscribe((response) => {
        sessionStorage.setItem('vendorDetails', JSON.stringify(response));
      })
  }

  ngOnDestroy() {
    this.unsubscribe.forEach((sb) => sb.unsubscribe());
  }
}
