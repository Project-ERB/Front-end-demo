import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddNewDepartymentComponent } from './add-new-departyment.component';

describe('AddNewDepartymentComponent', () => {
  let component: AddNewDepartymentComponent;
  let fixture: ComponentFixture<AddNewDepartymentComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AddNewDepartymentComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AddNewDepartymentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
