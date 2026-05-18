import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ReceivableManagmentComponent } from './receivable-managment.component';

describe('ReceivableManagmentComponent', () => {
  let component: ReceivableManagmentComponent;
  let fixture: ComponentFixture<ReceivableManagmentComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ReceivableManagmentComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ReceivableManagmentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
