import { ComponentFixture, TestBed } from '@angular/core/testing';

import { JopApplicationManagementComponent } from './jop-application-management.component';

describe('JopApplicationManagementComponent', () => {
  let component: JopApplicationManagementComponent;
  let fixture: ComponentFixture<JopApplicationManagementComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [JopApplicationManagementComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(JopApplicationManagementComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
