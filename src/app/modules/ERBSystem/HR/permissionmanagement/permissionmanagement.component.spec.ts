import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PermissionmanagementComponent } from './permissionmanagement.component';

describe('PermissionmanagementComponent', () => {
  let component: PermissionmanagementComponent;
  let fixture: ComponentFixture<PermissionmanagementComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PermissionmanagementComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PermissionmanagementComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
