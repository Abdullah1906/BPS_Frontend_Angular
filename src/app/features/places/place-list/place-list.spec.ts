import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PlaceList } from './place-list';

describe('PlaceList', () => {
  let component: PlaceList;
  let fixture: ComponentFixture<PlaceList>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PlaceList]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PlaceList);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
