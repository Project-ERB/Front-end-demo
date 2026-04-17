import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DeveloperDetailsComponent } from './developer-details.component';

describe('DeveloperDetailsComponent', () => {
  let component: DeveloperDetailsComponent;
  let fixture: ComponentFixture<DeveloperDetailsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DeveloperDetailsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DeveloperDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
