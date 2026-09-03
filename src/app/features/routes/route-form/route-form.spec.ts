import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RouteForm } from './route-form';

describe('RouteForm', () => {
  let component: RouteForm;
  let fixture: ComponentFixture<RouteForm>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RouteForm]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RouteForm);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
