import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SuperAdminOverviewComponent } from './super-admin-overview.component';

describe('SuperAdminOverviewComponent', () => {
  let component: SuperAdminOverviewComponent;
  let fixture: ComponentFixture<SuperAdminOverviewComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SuperAdminOverviewComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SuperAdminOverviewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
