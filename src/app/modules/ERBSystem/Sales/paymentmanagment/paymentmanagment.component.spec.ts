import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PaymentmanagmentComponent } from './paymentmanagment.component';

describe('PaymentmanagmentComponent', () => {
  let component: PaymentmanagmentComponent;
  let fixture: ComponentFixture<PaymentmanagmentComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PaymentmanagmentComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PaymentmanagmentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
