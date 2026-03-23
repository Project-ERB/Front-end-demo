import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SiedbarWarehouseComponent } from './siedbar-warehouse.component';

describe('SiedbarWarehouseComponent', () => {
  let component: SiedbarWarehouseComponent;
  let fixture: ComponentFixture<SiedbarWarehouseComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SiedbarWarehouseComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SiedbarWarehouseComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
