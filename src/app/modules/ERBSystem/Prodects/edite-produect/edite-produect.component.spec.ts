import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EditeProduectComponent } from './edite-produect.component';

describe('EditeProduectComponent', () => {
  let component: EditeProduectComponent;
  let fixture: ComponentFixture<EditeProduectComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EditeProduectComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EditeProduectComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
