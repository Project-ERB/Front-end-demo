import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SidebaSalesComponent } from './sideba-sales.component';

describe('SidebaSalesComponent', () => {
  let component: SidebaSalesComponent;
  let fixture: ComponentFixture<SidebaSalesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SidebaSalesComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SidebaSalesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
