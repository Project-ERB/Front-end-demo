import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CreatDiscountComponent } from './creat-discount.component';

describe('CreatDiscountComponent', () => {
  let component: CreatDiscountComponent;
  let fixture: ComponentFixture<CreatDiscountComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CreatDiscountComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CreatDiscountComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
