import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DiscountMangementComponent } from './discount-mangement.component';

describe('DiscountMangementComponent', () => {
  let component: DiscountMangementComponent;
  let fixture: ComponentFixture<DiscountMangementComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DiscountMangementComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DiscountMangementComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
