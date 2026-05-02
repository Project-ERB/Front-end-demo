import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AccessCameraComponent } from './access-camera.component';

describe('AccessCameraComponent', () => {
  let component: AccessCameraComponent;
  let fixture: ComponentFixture<AccessCameraComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AccessCameraComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AccessCameraComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
