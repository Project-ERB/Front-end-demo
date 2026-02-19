import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SiedeAdminComponent } from './siede-admin.component';

describe('SiedeAdminComponent', () => {
  let component: SiedeAdminComponent;
  let fixture: ComponentFixture<SiedeAdminComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SiedeAdminComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SiedeAdminComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
