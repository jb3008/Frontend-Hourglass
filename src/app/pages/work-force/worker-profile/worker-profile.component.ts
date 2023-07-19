import { Component, OnInit, ViewChild } from '@angular/core';

@Component({
  selector: 'app-worker-profile',
  templateUrl: './worker-profile.component.html',
  styleUrls: ['./worker-profile.component.scss'],
})
export class WorkerProfileComponent implements OnInit {
  constructor() {}

  ngOnInit(): void {}
  // @ViewChild("searchFilterInp") searchFilterInp: HTMLInputElement;
  searchFilterInp: string;

  isSelectedTab: string = 'Details';
  getSelectedTab(tab: string): void {
    console.log(tab);
    this.isSelectedTab = tab;
    // this.searchFilterInp.value =''
  }
}
