import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ERBComponent } from './erb.component';

describe('ERBComponent', () => {
  let component: ERBComponent;
  let fixture: ComponentFixture<ERBComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ERBComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ERBComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
