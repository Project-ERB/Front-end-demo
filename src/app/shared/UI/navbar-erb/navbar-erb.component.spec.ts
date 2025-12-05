import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NavbarERbComponent } from './navbar-erb.component';

describe('NavbarERbComponent', () => {
  let component: NavbarERbComponent;
  let fixture: ComponentFixture<NavbarERbComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NavbarERbComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(NavbarERbComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
