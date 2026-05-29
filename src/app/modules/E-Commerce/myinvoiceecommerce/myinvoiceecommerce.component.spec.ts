import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MyinvoiceecommerceComponent } from './myinvoiceecommerce.component';

describe('MyinvoiceecommerceComponent', () => {
  let component: MyinvoiceecommerceComponent;
  let fixture: ComponentFixture<MyinvoiceecommerceComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MyinvoiceecommerceComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MyinvoiceecommerceComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
