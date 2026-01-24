import { Component } from '@angular/core';
import { HRComponent } from "../../../../core/layout/hr/hr.component";
import { HrSidebarComponent } from "../../../../shared/UI/hr-sidebar/hr-sidebar.component";

@Component({
  selector: 'app-add-new-departyment',
  imports: [HRComponent, HrSidebarComponent],
  templateUrl: './add-new-departyment.component.html',
  styleUrl: './add-new-departyment.component.scss',
})
export class AddNewDepartymentComponent {

}
