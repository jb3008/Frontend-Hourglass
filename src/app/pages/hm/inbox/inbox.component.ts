import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-inbox',
  templateUrl: './inbox.component.html',
  styleUrls: ['./inbox.component.scss']
})
export class InboxComponent implements OnInit {

  constructor(private router: Router) { }

  ngOnInit(): void {
  }

  goToWorkOrders(){
    this.router.navigate(['/hm/work-order'], {queryParams: {from : 'inbox'}})
  }

}
