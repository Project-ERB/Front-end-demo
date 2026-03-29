import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UpdateJopComponent } from './update-jop.component';

describe('UpdateJopComponent', () => {
  let component: UpdateJopComponent;
  let fixture: ComponentFixture<UpdateJopComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UpdateJopComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(UpdateJopComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
