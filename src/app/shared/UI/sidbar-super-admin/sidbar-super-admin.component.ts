import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
@Component({
  selector: 'app-sidbar-super-admin',
  imports: [CommonModule],
  templateUrl: './sidbar-super-admin.component.html',
  styleUrl: './sidbar-super-admin.component.scss',
})
export class SidbarSuperAdminComponent {
  isHrExpanded = true;
  hrItems = [
    { label: 'Job Applications', icon: 'work' },
    { label: 'Candidates', icon: 'person_search' },
    { label: 'Contracts', icon: 'history_edu' },
  ];
}
