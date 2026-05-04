import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InventoryPredictionComponent } from './inventory-prediction.component';

describe('InventoryPredictionComponent', () => {
  let component: InventoryPredictionComponent;
  let fixture: ComponentFixture<InventoryPredictionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [InventoryPredictionComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(InventoryPredictionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
