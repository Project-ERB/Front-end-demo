import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NavbarECommerceComponent } from './navbar-e-commerce.component';

describe('NavbarECommerceComponent', () => {
  let component: NavbarECommerceComponent;
  let fixture: ComponentFixture<NavbarECommerceComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NavbarECommerceComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(NavbarECommerceComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
