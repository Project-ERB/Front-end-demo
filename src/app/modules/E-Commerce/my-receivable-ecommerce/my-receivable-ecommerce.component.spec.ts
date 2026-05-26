import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MyReceivableEcommerceComponent } from './my-receivable-ecommerce.component';

describe('MyReceivableEcommerceComponent', () => {
  let component: MyReceivableEcommerceComponent;
  let fixture: ComponentFixture<MyReceivableEcommerceComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MyReceivableEcommerceComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MyReceivableEcommerceComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
