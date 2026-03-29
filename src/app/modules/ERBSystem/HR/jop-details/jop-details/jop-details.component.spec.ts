import { ComponentFixture, TestBed } from '@angular/core/testing';

import { JopDetailsComponent } from './jop-details.component';

describe('JopDetailsComponent', () => {
  let component: JopDetailsComponent;
  let fixture: ComponentFixture<JopDetailsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [JopDetailsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(JopDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
