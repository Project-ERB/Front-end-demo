import { Component } from '@angular/core';
import { HRComponent } from "../../../../core/layout/hr/hr.component";
import { HrSidebarComponent } from "../../../../shared/UI/hr-sidebar/hr-sidebar.component";

@Component({
  selector: 'app-add-new-contract',
  imports: [HRComponent, HrSidebarComponent],
  templateUrl: './add-new-contract.component.html',
  styleUrl: './add-new-contract.component.scss',
})
export class AddNewContractComponent {

}
