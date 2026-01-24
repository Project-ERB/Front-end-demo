import { Component } from '@angular/core';
import { HRComponent } from "../../../../core/layout/hr/hr.component";
import { HrSidebarComponent } from '../../../../shared/UI/hr-sidebar/hr-sidebar.component';

@Component({
  selector: 'app-jop-application-management',
  imports: [HRComponent , HrSidebarComponent],
  templateUrl: './jop-application-management.component.html',
  styleUrl: './jop-application-management.component.scss',
})
export class JopApplicationManagementComponent {

}
