import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Utils } from 'src/app/services/utils';

@Component({
  selector: 'app-inbox',
  templateUrl: './inbox.component.html',
  styleUrls: ['./inbox.component.scss'],
})
export class InboxComponent implements OnInit {
  constructor(private router: Router, private utils: Utils) {}
  auth: any;
  ngOnInit(): void {
    this.auth = this.utils.getAuth();
  }
}
