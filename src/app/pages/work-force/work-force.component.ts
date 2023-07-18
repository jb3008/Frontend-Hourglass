import { Component, OnInit, ViewChild } from '@angular/core';

import { ModalConfig, ModalComponent } from '../../_metronic/partials';

@Component({
  selector: 'app-work-force',
  templateUrl: './work-force.component.html',
  styleUrls: ['./work-force.component.scss']
})
export class WorkForceComponent implements OnInit {

  modalConfig: ModalConfig = {
    modalTitle: 'Employee',
    dismissButtonLabel: 'Cancel',
    closeButtonLabel: 'Save'
  };
  @ViewChild('modal') private modalComponent: ModalComponent;
  constructor() {}

  async openModal() {
    return await this.modalComponent.open();
  }


  ngOnInit(): void {
    
  }

}
