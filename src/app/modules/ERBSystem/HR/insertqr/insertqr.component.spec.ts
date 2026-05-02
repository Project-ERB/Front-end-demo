import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InsertqrComponent } from './insertqr.component';

describe('InsertqrComponent', () => {
  let component: InsertqrComponent;
  let fixture: ComponentFixture<InsertqrComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [InsertqrComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(InsertqrComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
