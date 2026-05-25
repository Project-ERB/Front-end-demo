import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InvoicemanagmentComponent } from './invoicemanagment.component';

describe('InvoicemanagmentComponent', () => {
  let component: InvoicemanagmentComponent;
  let fixture: ComponentFixture<InvoicemanagmentComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [InvoicemanagmentComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(InvoicemanagmentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
