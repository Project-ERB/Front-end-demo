import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ManageRolePermissionsComponent } from './manage-role-permissions.component';

describe('ManageRolePermissionsComponent', () => {
  let component: ManageRolePermissionsComponent;
  let fixture: ComponentFixture<ManageRolePermissionsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ManageRolePermissionsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ManageRolePermissionsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
