import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MyReceivableComponent } from './my-receivable.component';

describe('MyReceivableComponent', () => {
  let component: MyReceivableComponent;
  let fixture: ComponentFixture<MyReceivableComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MyReceivableComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MyReceivableComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
