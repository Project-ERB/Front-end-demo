import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EditEmployeeInfoComponent } from './edit-employee-info.component';

describe('EditEmployeeInfoComponent', () => {
  let component: EditEmployeeInfoComponent;
  let fixture: ComponentFixture<EditEmployeeInfoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EditEmployeeInfoComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EditEmployeeInfoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
