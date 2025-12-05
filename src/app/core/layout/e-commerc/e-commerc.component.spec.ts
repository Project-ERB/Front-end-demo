import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ECommercComponent } from './e-commerc.component';

describe('ECommercComponent', () => {
  let component: ECommercComponent;
  let fixture: ComponentFixture<ECommercComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ECommercComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ECommercComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
