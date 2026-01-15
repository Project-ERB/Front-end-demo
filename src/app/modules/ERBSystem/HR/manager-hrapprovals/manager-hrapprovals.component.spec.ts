import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ManagerHRApprovalsComponent } from './manager-hrapprovals.component';

describe('ManagerHRApprovalsComponent', () => {
  let component: ManagerHRApprovalsComponent;
  let fixture: ComponentFixture<ManagerHRApprovalsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ManagerHRApprovalsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ManagerHRApprovalsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
