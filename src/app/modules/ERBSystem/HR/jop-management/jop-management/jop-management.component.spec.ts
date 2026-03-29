import { ComponentFixture, TestBed } from '@angular/core/testing';

import { JopManagementComponent } from './jop-management.component';

describe('JopManagementComponent', () => {
  let component: JopManagementComponent;
  let fixture: ComponentFixture<JopManagementComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [JopManagementComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(JopManagementComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
