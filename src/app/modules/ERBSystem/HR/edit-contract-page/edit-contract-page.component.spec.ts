import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EditContractPageComponent } from './edit-contract-page.component';

describe('EditContractPageComponent', () => {
  let component: EditContractPageComponent;
  let fixture: ComponentFixture<EditContractPageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EditContractPageComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EditContractPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
