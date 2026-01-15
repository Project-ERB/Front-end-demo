import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddProduectComponent } from './add-produect.component';

describe('AddProduectComponent', () => {
  let component: AddProduectComponent;
  let fixture: ComponentFixture<AddProduectComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AddProduectComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AddProduectComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
