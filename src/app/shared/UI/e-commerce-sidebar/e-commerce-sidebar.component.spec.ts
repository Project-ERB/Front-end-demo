import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ECommerceSidebarComponent } from './e-commerce-sidebar.component';

describe('ECommerceSidebarComponent', () => {
  let component: ECommerceSidebarComponent;
  let fixture: ComponentFixture<ECommerceSidebarComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ECommerceSidebarComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ECommerceSidebarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
