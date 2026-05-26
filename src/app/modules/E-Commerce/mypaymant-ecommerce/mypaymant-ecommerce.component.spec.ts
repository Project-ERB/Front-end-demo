import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MypaymantEcommerceComponent } from './mypaymant-ecommerce.component';

describe('MypaymantEcommerceComponent', () => {
  let component: MypaymantEcommerceComponent;
  let fixture: ComponentFixture<MypaymantEcommerceComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MypaymantEcommerceComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MypaymantEcommerceComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
