import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CategoryMangementComponent } from './category-mangement.component';

describe('CategoryMangementComponent', () => {
  let component: CategoryMangementComponent;
  let fixture: ComponentFixture<CategoryMangementComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CategoryMangementComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CategoryMangementComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
