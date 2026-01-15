import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AssignRolesToUserComponent } from './assign-roles-to-user.component';

describe('AssignRolesToUserComponent', () => {
  let component: AssignRolesToUserComponent;
  let fixture: ComponentFixture<AssignRolesToUserComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AssignRolesToUserComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AssignRolesToUserComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
