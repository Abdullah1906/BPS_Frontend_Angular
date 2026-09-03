import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RouteList } from './route-list';

describe('RouteList', () => {
  let component: RouteList;
  let fixture: ComponentFixture<RouteList>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RouteList]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RouteList);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
