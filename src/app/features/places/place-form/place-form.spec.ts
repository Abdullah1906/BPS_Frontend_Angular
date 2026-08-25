import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PlaceForm } from './place-form';

describe('PlaceForm', () => {
  let component: PlaceForm;
  let fixture: ComponentFixture<PlaceForm>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PlaceForm]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PlaceForm);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
