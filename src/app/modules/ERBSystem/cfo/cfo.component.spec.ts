import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CfoComponent } from './cfo.component';

describe('CfoComponent', () => {
  let component: CfoComponent;
  let fixture: ComponentFixture<CfoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CfoComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CfoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
