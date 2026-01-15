import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SidbarManagerHarapprovalsComponent } from './sidbar-manager-harapprovals.component';

describe('SidbarManagerHarapprovalsComponent', () => {
  let component: SidbarManagerHarapprovalsComponent;
  let fixture: ComponentFixture<SidbarManagerHarapprovalsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SidbarManagerHarapprovalsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SidbarManagerHarapprovalsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
