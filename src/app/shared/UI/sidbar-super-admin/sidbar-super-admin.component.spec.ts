import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SidbarSuperAdminComponent } from './sidbar-super-admin.component';

describe('SidbarSuperAdminComponent', () => {
  let component: SidbarSuperAdminComponent;
  let fixture: ComponentFixture<SidbarSuperAdminComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SidbarSuperAdminComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SidbarSuperAdminComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
