import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UsermanagemantComponent } from './usermanagemant.component';

describe('UsermanagemantComponent', () => {
  let component: UsermanagemantComponent;
  let fixture: ComponentFixture<UsermanagemantComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UsermanagemantComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(UsermanagemantComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
