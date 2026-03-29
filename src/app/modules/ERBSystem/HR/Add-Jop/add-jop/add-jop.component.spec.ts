import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddJopComponent } from './add-jop.component';

describe('AddJopComponent', () => {
  let component: AddJopComponent;
  let fixture: ComponentFixture<AddJopComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AddJopComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AddJopComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
