import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UbdateEmployeeComponent } from './ubdate-employee.component';

describe('UbdateEmployeeComponent', () => {
  let component: UbdateEmployeeComponent;
  let fixture: ComponentFixture<UbdateEmployeeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UbdateEmployeeComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(UbdateEmployeeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
